
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseAudioPlayerProps {
  audioUrl: string;
  onEnded?: () => void;
  onError?: () => void;
  isPlayingExternal?: boolean;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  nextAudioUrl?: string;
  onCrossfadeStart?: () => void;
  title?: string;
}

export const useAudioPlayer = ({
  audioUrl,
  onEnded,
  onError,
  isPlayingExternal,
  onPlayPauseChange,
  nextAudioUrl,
  onCrossfadeStart,
  title
}: UseAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLooping, setIsLooping] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const [isLiveStream, setIsLiveStream] = useState(false);
  const { toast } = useToast();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const crossfadeTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);

  // Constants for crossfade
  const CROSSFADE_DURATION = 5; // Duration of crossfade in seconds
  const MAX_RETRY_COUNT = 3;

  // Check if URL is potentially a live stream
  const checkIfLiveStream = (url: string) => {
    // Common live stream indicators
    return url.includes('radio') || 
           url.includes('stream') || 
           url.includes('live') || 
           url.endsWith('.m3u8') || 
           url.includes('icecast') || 
           url.includes('shoutcast');
  };
  
  // Validate and clean up the audioUrl
  const validateAudioUrl = (url: string): string => {
    if (!url) return '';
    
    // Remove any trailing or leading whitespace
    url = url.trim();
    
    // Ensure URL has valid protocol
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
      // If it's a relative path, add leading slash
      if (!url.startsWith('/')) {
        url = '/' + url;
      }
    }
    
    console.log("Validated audio URL:", url);
    return url;
  };

  // Play audio directly without preloading for external URLs
  const playDirectly = (url: string, audioElement: HTMLAudioElement | null) => {
    if (!audioElement) {
      console.error("Audio element not available");
      return;
    }
    
    // Validate URL
    url = validateAudioUrl(url);
    if (!url) {
      console.error("Invalid audio URL");
      setLoadError(true);
      if (onError) onError();
      return;
    }
    
    console.log("Playing directly:", url);
    
    // Check if potentially a live stream
    const potentialLiveStream = checkIfLiveStream(url);
    if (potentialLiveStream) {
      setIsLiveStream(true);
      // For live streams, we don't expect duration info
      setDuration(0);
    } else {
      setIsLiveStream(false);
    }
    
    // Reset error state
    setLoadError(false);
    
    // Set source and load
    audioElement.src = url;
    audioElement.load();
    
    // Set up event listeners for this direct play
    const onCanPlay = () => {
      console.log("Audio can play now:", url);
      
      audioElement.play()
        .then(() => {
          console.log("Audio playing successfully:", url);
          setIsPlaying(true);
          if (onPlayPauseChange) onPlayPauseChange(true);
          setIsLoaded(true);
          setLoadError(false);
          retryCountRef.current = 0; // Reset retry count on success
        })
        .catch(error => {
          console.error("Error playing direct URL:", error);
          setLoadError(true);
          if (onError) onError();
        });
      audioElement.removeEventListener('canplay', onCanPlay);
    };
    
    audioElement.addEventListener('canplay', onCanPlay);
    
    // Error handling
    const handleDirectError = (e: Event) => {
      console.error("Direct play error:", e);
      setLoadError(true);
      if (onError) onError();
      audioElement.removeEventListener('error', handleDirectError);
    };
    
    audioElement.addEventListener('error', handleDirectError);
  };

  // Handle external play/pause control
  useEffect(() => {
    if (isPlayingExternal !== undefined && audioRef.current) {
      console.log("External play control:", isPlayingExternal, "Current state:", isPlaying);
      if (isPlayingExternal && !isPlaying) {
        // Always use direct method for any URL
        playDirectly(audioUrl, audioRef.current);
      } else if (!isPlayingExternal && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isPlayingExternal, audioUrl]);

  // Set up crossfade when current track is near the end
  useEffect(() => {
    if (!nextAudioUrl || !isPlaying || isCrossfading || isLiveStream) return;
    
    const audio = audioRef.current;
    const nextAudio = nextAudioRef.current;
    
    if (!audio || !nextAudio || !isLoaded || duration === 0) return;
    
    // Start crossfade when we're CROSSFADE_DURATION seconds from the end
    if (duration - currentTime <= CROSSFADE_DURATION && duration > CROSSFADE_DURATION) {
      if (crossfadeTimeoutRef.current) return; // Prevent multiple crossfades
      
      setIsCrossfading(true);
      console.info("Starting crossfade");
      
      // Preload next track
      nextAudio.volume = 0;
      nextAudio.src = nextAudioUrl;
      nextAudio.load();
      
      // Start playing next track and gradually increase volume
      nextAudio.play()
        .then(() => {
          // Notify parent that crossfade has started
          if (onCrossfadeStart) onCrossfadeStart();
          
          // Calculate how much time is left in current track
          const timeLeft = duration - currentTime;
          
          // Gradually decrease volume of current track
          const fadeOutInterval = setInterval(() => {
            if (!audio) {
              clearInterval(fadeOutInterval);
              return;
            }
            
            const newVol = Math.max(0, audio.volume - (volume / (timeLeft * 10)));
            audio.volume = newVol;
            
            if (newVol <= 0.05) {
              clearInterval(fadeOutInterval);
            }
          }, 100);
          
          // Gradually increase volume of next track
          const fadeInInterval = setInterval(() => {
            if (!nextAudio) {
              clearInterval(fadeInInterval);
              return;
            }
            
            const newVol = Math.min(volume, nextAudio.volume + (volume / (timeLeft * 10)));
            nextAudio.volume = newVol;
            
            if (newVol >= volume - 0.05) {
              clearInterval(fadeInInterval);
            }
          }, 100);
          
          // When current track ends, trigger onEnded and reset crossfade
          crossfadeTimeoutRef.current = window.setTimeout(() => {
            if (onEnded) onEnded();
            crossfadeTimeoutRef.current = null;
            setIsCrossfading(false);
            // Reset the time to 0 for the new track
            setCurrentTime(0);
          }, timeLeft * 1000);
        })
        .catch(error => {
          console.error("Error starting crossfade:", error);
          setIsCrossfading(false);
        });
    }
  }, [currentTime, duration, isLoaded, isPlaying, nextAudioUrl, onCrossfadeStart, onEnded, volume, isCrossfading, isLiveStream]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    console.log("Setting up audio element for:", audioUrl);
    
    const setAudioData = () => {
      console.log("Audio data loaded for:", audioUrl, "Duration:", audio.duration);
      
      if (audio.duration !== Infinity && !isNaN(audio.duration)) {
        setDuration(audio.duration);
        setIsLiveStream(false);
      } else {
        // Infinite duration indicates a stream
        setIsLiveStream(true);
        setDuration(0);
      }
      
      setIsLoaded(true);
      setLoadError(false);
      
      // Auto-play when loaded if isPlayingExternal is true
      if (isPlayingExternal) {
        console.log("Auto-playing after load:", audioUrl);
        audio.play()
          .then(() => {
            setIsPlaying(true);
            if (onPlayPauseChange) onPlayPauseChange(true);
            retryCountRef.current = 0; // Reset retry count on success
          })
          .catch(error => {
            console.error("Error auto-playing audio:", error);
          });
      }
      
      toast({
        title: "Audio geladen",
        description: isLiveStream ? "Live stream is klaar om af te spelen." : "De audio is klaar om af te spelen."
      });
    };
    
    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      console.log("Audio ended:", audioUrl);
      
      // If we're crossfading, the crossfade handler will call onEnded
      // Only trigger onEnded if we're not crossfading (e.g., no next track)
      if (!isCrossfading) {
        if (!isLooping) {
          setIsPlaying(false);
          if (onPlayPauseChange) onPlayPauseChange(false);
          if (onEnded) onEnded();
        } else {
          // For looping, just restart the track
          audio.currentTime = 0;
          audio.play().catch(error => {
            console.error("Error restarting audio:", error);
          });
        }
      }
    };

    const handleError = (e: Event) => {
      console.error("Error loading audio:", e, "URL:", audioUrl);
      setLoadError(true);
      setIsLoaded(false);
      
      if (retryCountRef.current < MAX_RETRY_COUNT) {
        retryCountRef.current++;
        setIsRetrying(true);
        
        console.log(`Retrying (${retryCountRef.current}/${MAX_RETRY_COUNT})...`);
        
        // Try direct playback as fallback with delay
        setTimeout(() => {
          try {
            // Try direct playback again with adjusted URL
            const adjustedUrl = validateAudioUrl(audioUrl);
            console.log("Retrying with adjusted URL:", adjustedUrl);
            
            if (adjustedUrl) {
              playDirectly(adjustedUrl, audio);
            } else {
              throw new Error("Invalid URL after adjustment");
            }
            setIsRetrying(false);
          } catch (error) {
            console.error("Error retrying direct playback:", error);
            setIsRetrying(false);
            
            toast({
              variant: "destructive",
              title: "Fout bij laden",
              description: "Kon de audio niet laden. Controleer of de URL correct is."
            });
            if (onError) onError();
          }
        }, 1000);
      } else {
        console.error("Maximum retry count reached");
        setIsRetrying(false);
        
        toast({
          variant: "destructive",
          title: "Fout bij laden",
          description: "Kon de audio niet laden na meerdere pogingen. Controleer of het bestand bestaat."
        });
        if (onError) onError();
      }
    };
    
    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("loadedmetadata", setAudioData); // Added for streams
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    
    audio.volume = volume;
    audio.loop = isLooping;
    
    // Special event for live streams
    audio.addEventListener("progress", () => {
      // For live streams, we might not get duration
      if (audio.duration === Infinity || isNaN(audio.duration)) {
        setIsLiveStream(true);
      }
    });
    
    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("progress", () => {});
      
      // Clear crossfade timeout if component unmounts
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current);
        crossfadeTimeoutRef.current = null;
      }
    };
  }, [onEnded, volume, isLooping, toast, audioUrl, isRetrying, onError, isPlayingExternal, onPlayPauseChange, isCrossfading, isLiveStream]);

  // Reset audio state when audioUrl changes
  useEffect(() => {
    console.log("Audio URL changed to:", audioUrl);
    
    const audio = audioRef.current;
    if (!audio) return;
    
    // Clean up existing playback
    audio.pause();
    
    setCurrentTime(0);
    setIsLoaded(false);
    setLoadError(false);
    setIsRetrying(false);
    setIsCrossfading(false);
    setIsLiveStream(checkIfLiveStream(audioUrl));
    retryCountRef.current = 0;
    
    if (crossfadeTimeoutRef.current) {
      clearTimeout(crossfadeTimeoutRef.current);
      crossfadeTimeoutRef.current = null;
    }
    
    // If URL is empty, don't try to play
    if (!audioUrl) {
      console.log("Empty audio URL, not attempting to play");
      return;
    }
    
    // Always use direct playback method when URL changes
    if (isPlayingExternal) {
      console.log("External play requested for new URL:", audioUrl);
      // Short delay to allow state to reset
      setTimeout(() => {
        playDirectly(audioUrl, audio);
      }, 100);
    } else {
      console.log("Loading new URL without autoplay:", audioUrl);
      const validatedUrl = validateAudioUrl(audioUrl);
      if (validatedUrl) {
        audio.src = validatedUrl;
        audio.load();
      }
    }
  }, [audioUrl, isPlayingExternal]);

  // Seamless loop handling
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isLiveStream) return;
    
    audio.loop = isLooping;
    
    if (isLooping) {
      const handleSeamlessLoop = () => {
        if (audio.duration > 0 && audio.currentTime >= audio.duration - 0.2) {
          const currentVolume = audio.volume;
          const currentPlaybackRate = audio.playbackRate;
          
          audio.currentTime = 0;
          audio.playbackRate = currentPlaybackRate;
          audio.volume = currentVolume;
        }
      };
      
      const intervalId = setInterval(handleSeamlessLoop, 10);
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isLooping, isLiveStream]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    console.log("Toggle play, current state:", isPlaying);
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (onPlayPauseChange) onPlayPauseChange(false);
      
      // If we're in the middle of a crossfade, also pause the next track
      if (isCrossfading && nextAudioRef.current) {
        nextAudioRef.current.pause();
      }
      
      toast({
        title: "Gepauzeerd",
        description: "De audio is gepauzeerd."
      });
    } else {
      // Always use direct method to play
      if (!isLoaded) {
        console.log("Not loaded yet, using direct play");
        playDirectly(audioUrl, audio);
      } else {
        console.log("Already loaded, using regular play");
        audio.play()
          .then(() => {
            setIsPlaying(true);
            if (onPlayPauseChange) onPlayPauseChange(true);
            
            // If we're in the middle of a crossfade, also resume the next track
            if (isCrossfading && nextAudioRef.current) {
              nextAudioRef.current.play().catch(error => {
                console.error("Error resuming next audio:", error);
              });
            }
            
            toast({
              title: "Speelt nu",
              description: title ? `"${title}" speelt nu` : "De audio speelt nu"
            });
          })
          .catch(error => {
            console.error("Error playing audio:", error);
            toast({
              variant: "destructive",
              title: "Fout bij afspelen",
              description: "Kon de audio niet afspelen. Probeer het later opnieuw."
            });
          });
      }
    }
  };

  const handleRetry = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    console.log("Manual retry requested for:", audioUrl);
    
    setLoadError(false);
    setIsRetrying(true);
    retryCountRef.current = 0; // Reset retry count for manual retry
    
    // Always use direct method
    setTimeout(() => {
      playDirectly(audioUrl, audio);
      
      toast({
        title: "Opnieuw laden",
        description: "Probeert audio opnieuw te laden."
      });
    }, 100);
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    toast({
      title: !isLooping ? "Herhalen aan" : "Herhalen uit",
      description: !isLooping ? "De audio zal blijven herhalen" : "De audio zal stoppen na afloop"
    });
  };

  const handleProgressChange = (newValue: number[]) => {
    const audio = audioRef.current;
    if (!audio || isLiveStream) return;
    
    const newTime = newValue[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    
    // If we were crossfading but user seeks back, cancel crossfade
    if (isCrossfading && duration - newTime > CROSSFADE_DURATION) {
      setIsCrossfading(false);
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current);
        crossfadeTimeoutRef.current = null;
      }
      if (nextAudioRef.current) {
        nextAudioRef.current.pause();
      }
      audio.volume = volume;
    }
  };

  const handleVolumeChange = (newValue: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = newValue[0];
    
    // If we're crossfading, adjust both volumes proportionally
    if (isCrossfading && nextAudioRef.current) {
      const currentRatio = audio.volume / volume;
      const nextRatio = nextAudioRef.current.volume / volume;
      
      audio.volume = newVolume * currentRatio;
      nextAudioRef.current.volume = newVolume * nextRatio;
    } else {
      audio.volume = newVolume;
    }
    
    setVolume(newVolume);
  };

  const skipTime = (amount: number) => {
    const audio = audioRef.current;
    if (!audio || isLiveStream) return;
    
    audio.currentTime = Math.min(Math.max(audio.currentTime + amount, 0), duration);
  };

  return {
    audioRef,
    nextAudioRef,
    isPlaying,
    duration,
    currentTime,
    volume,
    isLooping,
    isLoaded,
    loadError,
    isRetrying,
    isCrossfading,
    isLiveStream,
    togglePlay,
    handleRetry,
    toggleLoop,
    handleProgressChange,
    handleVolumeChange,
    skipTime
  };
};
