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

const CROSSFADE_DURATION = 5;
const MAX_RETRY_ATTEMPTS = 3;

// Track existing audio contexts globally to prevent duplicate connections
const connectedAudioElements = new WeakMap();

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
  const [retryAttempts, setRetryAttempts] = useState(0);
  
  const { toast } = useToast();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const nextAudioRef = useRef<HTMLAudioElement>(null);
  const crossfadeTimeoutRef = useRef<number | null>(null);
  const lastValidUrlRef = useRef<string | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const checkIfLiveStream = (url: string) => {
    if (url.includes('meditation') || url.includes('meditatie')) {
      return false;
    }
    
    return url.includes('radio') || 
           url.includes('stream') || 
           url.includes('live') || 
           url.endsWith('.m3u8') || 
           url.includes('icecast') || 
           url.includes('shoutcast');
  };

  const playDirectly = (url: string, audioElement: HTMLAudioElement | null) => {
    if (!audioElement) {
      console.error("No audio element available");
      return;
    }
    
    if (!url) {
      console.error("No URL provided for playback");
      setLoadError(true);
      if (onError) onError();
      return;
    }
    
    const potentialLiveStream = checkIfLiveStream(url);
    if (potentialLiveStream) {
      setIsLiveStream(true);
      setDuration(0);
    } else {
      setIsLiveStream(false);
    }
    
    try {
      // Stop any current playback
      audioElement.pause();
      
      // Reset the audio element
      audioElement.src = url;
      audioElement.load();
      
      console.log("Setting audio source to:", url);
      
      const onCanPlay = () => {
        if (!audioElement) return;
        
        audioElement.play()
          .then(() => {
            setIsPlaying(true);
            if (onPlayPauseChange) onPlayPauseChange(true);
            setIsLoaded(true);
            setLoadError(false);
            setRetryAttempts(0);
            lastValidUrlRef.current = url;
            console.log("Audio playing successfully after canplay event");
          })
          .catch(error => {
            console.error("Error playing direct URL:", error);
            handlePlaybackError();
          });
        audioElement.removeEventListener('canplay', onCanPlay);
      };
      
      audioElement.addEventListener('canplay', onCanPlay);
      
      // Set a timeout in case canplay never fires
      const timeoutId = setTimeout(() => {
        if (!isLoaded) {
          console.warn("Canplay event never fired, trying to play anyway");
          audioElement.play()
            .then(() => {
              setIsPlaying(true);
              if (onPlayPauseChange) onPlayPauseChange(true);
              setIsLoaded(true);
              setLoadError(false);
              lastValidUrlRef.current = url;
            })
            .catch(error => {
              console.error("Error playing after timeout:", error);
              handlePlaybackError();
            });
        }
      }, 5000);
      
      const handleDirectError = (e: Event) => {
        console.error(`Error loading audio for URL ${url}:`, e);
        audioElement.removeEventListener('error', handleDirectError);
        clearTimeout(timeoutId);
        handlePlaybackError();
      };
      
      audioElement.addEventListener('error', handleDirectError);
      
      // Clean up event listeners if unmounted
      return () => {
        audioElement.removeEventListener('canplay', onCanPlay);
        audioElement.removeEventListener('error', handleDirectError);
        clearTimeout(timeoutId);
      };
    } catch (error) {
      console.error("Exception during playDirectly:", error);
      handlePlaybackError();
    }
    
    function handlePlaybackError() {
      setLoadError(true);
      setIsLoaded(false);
      setIsPlaying(false);
      if (onPlayPauseChange) onPlayPauseChange(false);
      if (onError) onError();
    }
  };

  useEffect(() => {
    if (isPlayingExternal !== undefined && audioRef.current) {
      if (isPlayingExternal && !isPlaying) {
        playDirectly(audioUrl, audioRef.current);
      } else if (!isPlayingExternal && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isPlayingExternal, isPlaying, isLoaded, audioUrl]);
  
  useEffect(() => {
    if (!nextAudioUrl || !isPlaying || isCrossfading || isLiveStream) return;
    
    const audio = audioRef.current;
    const nextAudio = nextAudioRef.current;
    
    if (!audio || !nextAudio || !isLoaded || duration === 0) return;
    
    if (duration - currentTime <= CROSSFADE_DURATION && duration > CROSSFADE_DURATION) {
      if (crossfadeTimeoutRef.current) return;
      
      setIsCrossfading(true);
      console.info("Starting crossfade");
      
      nextAudio.volume = 0;
      nextAudio.src = nextAudioUrl;
      nextAudio.load();
      
      nextAudio.play()
        .then(() => {
          if (onCrossfadeStart) onCrossfadeStart();
          
          const timeLeft = duration - currentTime;
          
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
          
          crossfadeTimeoutRef.current = window.setTimeout(() => {
            if (onEnded) onEnded();
            crossfadeTimeoutRef.current = null;
            setIsCrossfading(false);
            setCurrentTime(0);
          }, timeLeft * 1000);
        })
        .catch(error => {
          console.error("Error starting crossfade:", error);
          setIsCrossfading(false);
        });
    }
  }, [currentTime, duration, isLoaded, isPlaying, nextAudioUrl, onCrossfadeStart, onEnded, volume, isCrossfading, isLiveStream]);
  
  // Set up audio context and connect gain node
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (onAudioElementRef) {
      onAudioElementRef(audio);
    }
    
    // Check if we've already set up audio processing for this element
    if (connectedAudioElements.has(audio)) {
      console.log("Audio element already has context, skipping setup");
      return;
    }
    
    try {
      // Create a new audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      // Create gain node to control volume without affecting the analyzer
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.5; // Set to 50% of original volume
      gainNodeRef.current = gainNode;
      
      // Create media element source
      const source = audioContext.createMediaElementSource(audio);
      
      // Connect the source to the gain node and then to the destination
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Mark this audio element as connected
      connectedAudioElements.set(audio, { 
        context: audioContext, 
        source, 
        gainNode 
      });
      
      console.log("Successfully set up audio processing chain");
    } catch (error) {
      console.error("Error creating audio processing chain:", error);
      // Even if we have an error, we should still be able to play audio directly
    }
    
    const setAudioData = () => {
      console.log("Audio loaded. Duration:", audio.duration);
      
      // Specifically force duration for meditation files
      if (audioUrl.includes('meditation') || audioUrl.includes('meditatie')) {
        setIsLiveStream(false);
        if (!isNaN(audio.duration) && audio.duration !== Infinity) {
          setDuration(audio.duration);
        } else {
          // Default duration for meditation files if we can't determine it
          setDuration(300); // 5 minutes default
        }
      } else if (audio.duration !== Infinity && !isNaN(audio.duration)) {
        setDuration(audio.duration);
        setIsLiveStream(false);
      } else {
        setIsLiveStream(true);
        setDuration(0);
      }
      
      setIsLoaded(true);
      setLoadError(false);
      setRetryAttempts(0);
      
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
      if (!isCrossfading) {
        if (!isLooping) {
          setIsPlaying(false);
          if (onPlayPauseChange) onPlayPauseChange(false);
          if (onEnded) onEnded();
        } else {
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
      
      // Try using the last valid URL if available and different from current
      if (lastValidUrlRef.current && lastValidUrlRef.current !== audioUrl) {
        console.log("Trying last valid URL:", lastValidUrlRef.current);
        setTimeout(() => {
          playDirectly(lastValidUrlRef.current!, audio);
        }, 1000);
        return;
      }
      
      if (retryAttempts < MAX_RETRY_ATTEMPTS) {
        setIsRetrying(true);
        setRetryAttempts(prev => prev + 1);
        
        setTimeout(() => {
          try {
            if (audioUrl && (audioUrl.startsWith('http') || audioUrl.startsWith('/'))) {
              console.log("Attempting retry playback for:", audioUrl);
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
          description: "Kon de audio niet laden na meerdere pogingen. Controleer of het bestand bestaat."
        });
        setIsRetrying(false);
        if (onError) onError();
      }
    };
    
    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    
    audio.volume = volume;
    audio.loop = isLooping;
    
    audio.addEventListener("progress", () => {
      // Only consider it a livestream if it matches our criteria
      // For meditation files, ensure we never mark them as livestreams
      if ((audio.duration === Infinity || isNaN(audio.duration)) && 
          !audioUrl.includes('meditation') && !audioUrl.includes('meditatie')) {
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
      
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current);
        crossfadeTimeoutRef.current = null;
      }
      
      if (onAudioElementRef) {
        onAudioElementRef(null);
      }
      
      // Note: We don't clean up the audio context here anymore
      // This would be done when the component is fully unmounted
    };
  }, [onEnded, isLooping, toast, audioUrl, isRetrying, onError, isPlayingExternal, onPlayPauseChange, isCrossfading, isLiveStream, onAudioElementRef, retryAttempts, volume]);
  
  // Clean up audio context when component is unmounted
  useEffect(() => {
    return () => {
      // Clean up audio processing when component unmounts
      const audio = audioRef.current;
      if (audio && connectedAudioElements.has(audio)) {
        try {
          const { context, source, gainNode } = connectedAudioElements.get(audio);
          if (source) source.disconnect();
          if (gainNode) gainNode.disconnect();
          if (context) context.close();
          connectedAudioElements.delete(audio);
          console.log("Cleaned up audio context on unmount");
        } catch (error) {
          console.error("Error cleaning up audio context:", error);
        }
      }
    };
  }, []);
  
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
    
    if (isPlayingExternal) {
      playDirectly(audioUrl, audio);
    } else {
      audio.src = audioUrl;
      audio.load();
    }
  }, [audioUrl, isPlayingExternal]);
  
  // Update volume through gain node if available
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Apply gain node if available
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = 0.5; // Keep at 50%
      audio.volume = volume; // Set volume on audio element
    } else {
      // Fall back to regular volume control
      audio.volume = volume * 0.5; // Apply 50% reduction
    }
  }, [volume]);
  
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
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (onPlayPauseChange) onPlayPauseChange(false);
      
      if (isCrossfading && nextAudioRef.current) {
        nextAudioRef.current.pause();
      }
      
      toast({
        title: "Gepauzeerd",
        description: "De audio is gepauzeerd."
      });
    } else {
      if (!isLoaded) {
        playDirectly(audioUrl, audio);
      } else {
        audio.play()
          .then(() => {
            setIsPlaying(true);
            if (onPlayPauseChange) onPlayPauseChange(true);
            
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
    setRetryAttempts(0);
    
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    
    setTimeout(() => {
      try {
        if (audioUrl && (audioUrl.startsWith('http') || audioUrl.startsWith('/'))) {
          console.log("Attempting fallback playback for:", audioUrl);
          playDirectly(audioUrl, audio);
          setIsRetrying(false);
        } else {
          console.error("Invalid URL for retry:", audioUrl);
          toast({
            variant: "destructive",
            title: "Fout bij laden",
            description: "Ongeldige audio URL."
          });
        }
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
    setVolume(newVolume);
    
    if (gainNodeRef.current) {
      // Volume is controlled through the gain node (which is already at 50%)
      audio.volume = newVolume;
    } else {
      // Apply 50% reduction directly
      audio.volume = newVolume * 0.5;
    }
    
    if (isCrossfading && nextAudioRef.current) {
      const currentRatio = audio.volume / volume;
      const nextRatio = nextAudioRef.current.volume / volume;
      
      if (gainNodeRef.current) {
        audio.volume = newVolume * currentRatio;
        nextAudioRef.current.volume = newVolume * nextRatio;
      } else {
        audio.volume = newVolume * currentRatio * 0.5;
        nextAudioRef.current.volume = newVolume * nextRatio * 0.5;
      }
    }
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
