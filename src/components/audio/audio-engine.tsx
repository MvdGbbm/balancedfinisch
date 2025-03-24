import { RefObject, useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface AudioEngineProps {
  audioUrl: string;
  isPlayingExternal?: boolean;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  volume: number;
  isLooping: boolean;
  onAudioElementRef?: (element: HTMLAudioElement | null) => void;
  onEnded?: () => void;
  onError?: () => void;
  nextAudioUrl?: string;
  onCrossfadeStart?: () => void;
}

export interface AudioEngineState {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  duration: number;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  isLoaded: boolean;
  loadError: boolean;
  isRetrying: boolean;
  isCrossfading: boolean;
  isLiveStream: boolean;
  audioRef: RefObject<HTMLAudioElement>;
  nextAudioRef: RefObject<HTMLAudioElement>;
  handleProgressChange: (newValue: number[]) => void;
  handleVolumeChange: (newValue: number[]) => void;
  togglePlay: () => void;
  toggleLoop: () => void;
  handleRetry: () => void;
  skipTime: (amount: number) => void;
  isLooping: boolean;
}

// Constants for crossfade
const CROSSFADE_DURATION = 5; // Duration of crossfade in seconds

export function useAudioEngine({
  audioUrl,
  isPlayingExternal,
  onPlayPauseChange,
  volume: initialVolume,
  isLooping: initialLooping,
  onAudioElementRef,
  onEnded,
  onError,
  nextAudioUrl,
  onCrossfadeStart,
}: AudioEngineProps): AudioEngineState {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(initialVolume);
  const [isLooping, setIsLooping] = useState(initialLooping);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const [isLiveStream, setIsLiveStream] = useState(false);
  
  const { toast } = useToast();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const nextAudioRef = useRef<HTMLAudioElement>(null);
  const crossfadeTimeoutRef = useRef<number | null>(null);

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

  // Play audio directly without preloading for external URLs
  const playDirectly = (url: string, audioElement: HTMLAudioElement | null) => {
    if (!audioElement) return;
    
    // Check if potentially a live stream
    const potentialLiveStream = checkIfLiveStream(url);
    if (potentialLiveStream) {
      setIsLiveStream(true);
      // For live streams, we don't expect duration info
      setDuration(0);
    } else {
      setIsLiveStream(false);
    }
    
    // Fix 1: Make sure we set the src attribute properly
    try {
      audioElement.src = url;
      audioElement.load();
      
      console.log("Setting audio source to:", url);
      
      // Set up event listeners for this direct play
      const onCanPlay = () => {
        audioElement.play()
          .then(() => {
            setIsPlaying(true);
            if (onPlayPauseChange) onPlayPauseChange(true);
            setIsLoaded(true);
            setLoadError(false);
            console.log("Audio playing successfully after canplay event");
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
        console.error(`Error loading audio for URL ${url}:`, e);
        setLoadError(true);
        if (onError) onError();
        audioElement.removeEventListener('error', handleDirectError);
      };
      
      audioElement.addEventListener('error', handleDirectError);
    } catch (error) {
      console.error("Exception during playDirectly:", error);
      setLoadError(true);
      if (onError) onError();
    }
  };

  // Handle external play/pause control
  useEffect(() => {
    if (isPlayingExternal !== undefined && audioRef.current) {
      if (isPlayingExternal && !isPlaying) {
        // Always use direct method for any URL
        playDirectly(audioUrl, audioRef.current);
      } else if (!isPlayingExternal && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isPlayingExternal, isPlaying, isLoaded, audioUrl]);
  
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
    
    // Pass the audio element reference to the parent component if the callback exists
    if (onAudioElementRef) {
      onAudioElementRef(audio);
    }
    
    const setAudioData = () => {
      console.log("Audio loaded. Duration:", audio.duration);
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
        audio.play()
          .then(() => {
            setIsPlaying(true);
            console.log("Auto-play successful");
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
      console.error("Error loading audio:", e, "Current src:", audio.src);
      setLoadError(true);
      setIsLoaded(false);
      
      if (!isRetrying) {
        setIsRetrying(true);
        
        // Try direct playback as fallback
        setTimeout(() => {
          try {
            // Check if URL is still valid before retrying
            if (audioUrl && (audioUrl.startsWith('http') || audioUrl.startsWith('/'))) {
              console.log("Attempting fallback playback for:", audioUrl);
              // Try direct playback again
              playDirectly(audioUrl, audio);
            } else {
              console.error("Invalid URL for retry:", audioUrl);
              toast({
                variant: "destructive",
                title: "Fout bij laden",
                description: "Ongeldige audio URL."
              });
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
        toast({
          variant: "destructive",
          title: "Fout bij laden",
          description: "Kon de audio niet laden. Controleer of het bestand bestaat."
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
      
      // Clear the audio element reference when the component unmounts
      if (onAudioElementRef) {
        onAudioElementRef(null);
      }
    };
  }, [onEnded, volume, isLooping, toast, audioUrl, isRetrying, onError, isPlayingExternal, onPlayPauseChange, isCrossfading, isLiveStream, onAudioElementRef]);
  
  // Reset audio state when audioUrl changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    setCurrentTime(0);
    setIsLoaded(false);
    setLoadError(false);
    setIsRetrying(false);
    setIsCrossfading(false);
    setIsLiveStream(checkIfLiveStream(audioUrl));
    
    if (crossfadeTimeoutRef.current) {
      clearTimeout(crossfadeTimeoutRef.current);
      crossfadeTimeoutRef.current = null;
    }
    
    // Always use direct playback method
    if (isPlayingExternal) {
      playDirectly(audioUrl, audio);
    } else {
      audio.load();
    }
  }, [audioUrl, isPlayingExternal]);
  
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

  // Functions to control audio playback
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
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
        playDirectly(audioUrl, audio);
      } else {
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
              title: "Speelt nu"
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
    
    console.log("Retrying audio playback for URL:", audioUrl);
    setLoadError(false);
    setIsRetrying(true);
    
    // Reset audio element completely
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    
    // Short timeout before retrying
    setTimeout(() => {
      try {
        // Try direct playback again with full URL
        playDirectly(audioUrl, audio);
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
    isPlaying,
    setIsPlaying,
    duration,
    currentTime,
    setCurrentTime,
    isLoaded,
    loadError,
    isRetrying,
    isCrossfading,
    isLiveStream,
    audioRef,
    nextAudioRef,
    handleProgressChange,
    handleVolumeChange,
    togglePlay,
    toggleLoop,
    handleRetry,
    skipTime,
    isLooping
  };
}
