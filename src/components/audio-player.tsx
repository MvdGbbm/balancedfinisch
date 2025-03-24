
import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, SkipBack, SkipForward, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { quotes } from "@/data/quotes";
import { useToast } from "@/hooks/use-toast";

interface AudioPlayerProps {
  audioUrl: string;
  showControls?: boolean;
  showTitle?: boolean;
  title?: string;
  className?: string;
  onEnded?: () => void;
  onError?: () => void;
  customSoundscapeSelector?: React.ReactNode;
  showQuote?: boolean;
  isPlayingExternal?: boolean;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  nextAudioUrl?: string; // URL for the next track to crossfade
  onCrossfadeStart?: () => void; // Called when crossfade starts
  onAudioElementRef?: (element: HTMLAudioElement | null) => void; // Added missing prop
}

export function AudioPlayer({ 
  audioUrl, 
  showControls = true, 
  showTitle = false,
  title,
  className, 
  onEnded,
  onError,
  customSoundscapeSelector,
  showQuote = false,
  isPlayingExternal,
  onPlayPauseChange,
  nextAudioUrl,
  onCrossfadeStart,
  onAudioElementRef
}: AudioPlayerProps) {
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
  
  const [randomQuote] = useState(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const nextAudioRef = useRef<HTMLAudioElement>(null);
  const crossfadeTimeoutRef = useRef<number | null>(null);
  
  // Constants for crossfade
  const CROSSFADE_DURATION = 5; // Duration of crossfade in seconds

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
    
    audioElement.src = url;
    audioElement.load();
    
    // Set up event listeners for this direct play
    const onCanPlay = () => {
      audioElement.play()
        .then(() => {
          setIsPlaying(true);
          if (onPlayPauseChange) onPlayPauseChange(true);
          setIsLoaded(true);
          setLoadError(false);
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
    const handleDirectError = () => {
      setLoadError(true);
      if (onError) onError();
      audioElement.removeEventListener('error', handleDirectError);
    };
    
    audioElement.addEventListener('error', handleDirectError);
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
      console.error("Error loading audio:", e);
      setLoadError(true);
      setIsLoaded(false);
      
      if (!isRetrying) {
        setIsRetrying(true);
        
        // Try direct playback as fallback
        setTimeout(() => {
          try {
            // Try direct playback again
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
    
    setLoadError(false);
    setIsRetrying(true);
    
    // Always use direct method
    playDirectly(audioUrl, audio);
    
    toast({
      title: "Opnieuw laden",
      description: "Probeert audio opnieuw te laden."
    });
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
  
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  
  const skipTime = (amount: number) => {
    const audio = audioRef.current;
    if (!audio || isLiveStream) return;
    
    audio.currentTime = Math.min(Math.max(audio.currentTime + amount, 0), duration);
  };
  
  return (
    <div className={cn("w-full space-y-3 rounded-lg p-3 bg-card/50 shadow-sm", className)}>
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" />
      {nextAudioUrl && <audio ref={nextAudioRef} preload="metadata" crossOrigin="anonymous" />}
      
      {showTitle && title && (
        <h3 className="text-lg font-medium">{title}</h3>
      )}
      
      {loadError && (
        <div className="p-2 rounded-md bg-destructive/10 text-destructive text-center">
          <p className="text-sm">Er is een probleem met het laden van de audio.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-1" 
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? "Opnieuw laden..." : "Opnieuw proberen"}
          </Button>
        </div>
      )}
      
      {showQuote && (
        <div className="mb-2 p-2 rounded-md bg-primary/10 text-center">
          <p className="text-sm italic">"{randomQuote.text}"</p>
          <p className="text-xs text-muted-foreground mt-1">- {randomQuote.author}</p>
        </div>
      )}
      
      {customSoundscapeSelector && !showQuote && (
        <div className="mb-2">{customSoundscapeSelector}</div>
      )}
      
      <div className="w-full flex items-center space-x-2">
        <div className="text-xs w-10 text-right">{formatTime(currentTime)}</div>
        <div className="flex-grow">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.01}
            onValueChange={handleProgressChange}
            className={cn(
              "audio-player-slider",
              (isCrossfading || isLiveStream) && "cursor-wait opacity-70"
            )}
            disabled={!isLoaded || isCrossfading || isLiveStream}
          />
        </div>
        <div className="text-xs w-10">
          {isLiveStream ? "LIVE" : formatTime(duration)}
        </div>
      </div>
      
      {showControls && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => skipTime(-10)}
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full"
              disabled={!isLoaded || isCrossfading || isLiveStream}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={togglePlay}
              size="icon"
              variant="outline"
              className="h-10 w-10 rounded-full"
              disabled={!isLoaded && !loadError}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            
            <Button
              onClick={() => skipTime(10)}
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full"
              disabled={!isLoaded || isCrossfading || isLiveStream}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center ml-2 space-x-1">
              <Button
                onClick={toggleLoop}
                size="icon"
                variant={isLooping ? "default" : "ghost"}
                className={cn(
                  "h-8 w-8 rounded-full transition-colors",
                  isLooping && "bg-primary text-primary-foreground"
                )}
                disabled={!isLoaded || isLiveStream}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>
      )}
    </div>
  );
}
