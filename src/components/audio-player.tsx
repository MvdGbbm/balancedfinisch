
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
  nextTrackUrl?: string; // URL of the next track for crossfading
  enableCrossfade?: boolean; // Whether to enable crossfading
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
  nextTrackUrl,
  enableCrossfade = false
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLooping, setIsLooping] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();
  
  const [randomQuote] = useState(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const crossfadeTimeoutRef = useRef<number | null>(null);
  
  // Create next track audio element for crossfading
  useEffect(() => {
    if (enableCrossfade && nextTrackUrl) {
      nextAudioRef.current = new Audio(nextTrackUrl);
      nextAudioRef.current.volume = 0;
      nextAudioRef.current.preload = "auto";
      
      return () => {
        if (nextAudioRef.current) {
          nextAudioRef.current.pause();
          nextAudioRef.current.src = "";
          nextAudioRef.current = null;
        }
      };
    }
  }, [nextTrackUrl, enableCrossfade]);
  
  // Handle external play/pause control
  useEffect(() => {
    if (isPlayingExternal !== undefined && audioRef.current) {
      if (isPlayingExternal && !isPlaying && isLoaded) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Error playing audio:", error);
          });
      } else if (!isPlayingExternal && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isPlayingExternal, isPlaying, isLoaded]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const setAudioData = () => {
      setDuration(audio.duration);
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
        description: "De meditatie is klaar om af te spelen."
      });
    };
    
    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
      
      // Start crossfading when we're within 10 seconds of the end
      if (enableCrossfade && nextTrackUrl && !isLooping && audio.duration > 0) {
        const timeRemaining = audio.duration - audio.currentTime;
        
        if (timeRemaining <= 10 && timeRemaining > 0 && nextAudioRef.current && !crossfadeTimeoutRef.current) {
          // Start next track and fade it in
          const nextAudio = nextAudioRef.current;
          
          // Reset to beginning and start playing
          nextAudio.currentTime = 0;
          
          nextAudio.play()
            .then(() => {
              console.log("Started playing next track for crossfade");
              
              // Calculate fade duration based on remaining time
              const fadeDuration = Math.min(timeRemaining * 1000, 10000);
              const fadeSteps = 20;
              const stepTime = fadeDuration / fadeSteps;
              let step = 0;
              
              // Gradually fade out current track and fade in next track
              const fadeInterval = window.setInterval(() => {
                step++;
                const progress = step / fadeSteps;
                
                // Fade out current track
                if (audio) {
                  audio.volume = volume * (1 - progress);
                }
                
                // Fade in next track
                if (nextAudio) {
                  nextAudio.volume = volume * progress;
                }
                
                // Complete fade
                if (step >= fadeSteps) {
                  clearInterval(fadeInterval);
                  crossfadeTimeoutRef.current = null;
                }
              }, stepTime);
              
              crossfadeTimeoutRef.current = fadeInterval as unknown as number;
            })
            .catch(error => {
              console.error("Error starting crossfade:", error);
            });
        }
      }
    };
    
    const handleEnded = () => {
      if (!isLooping) {
        setIsPlaying(false);
        if (onPlayPauseChange) onPlayPauseChange(false);
        if (onEnded) onEnded();
        
        // Clear any active crossfade
        if (crossfadeTimeoutRef.current) {
          clearInterval(crossfadeTimeoutRef.current);
          crossfadeTimeoutRef.current = null;
        }
      }
    };

    const handleError = (e: Event) => {
      console.error("Error loading audio:", e);
      setLoadError(true);
      setIsLoaded(false);
      
      if (audioUrl.startsWith('http') && !isRetrying) {
        setIsRetrying(true);
        
        setTimeout(() => {
          audio.load();
          setIsRetrying(false);
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
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    
    audio.volume = volume;
    audio.loop = isLooping;
    
    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      
      // Clear any crossfade interval on cleanup
      if (crossfadeTimeoutRef.current) {
        clearInterval(crossfadeTimeoutRef.current);
        crossfadeTimeoutRef.current = null;
      }
    };
  }, [onEnded, volume, isLooping, toast, audioUrl, isRetrying, onError, isPlayingExternal, onPlayPauseChange, enableCrossfade, nextTrackUrl]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    setCurrentTime(0);
    setIsLoaded(false);
    setLoadError(false);
    setIsRetrying(false);
    
    audio.load();
    
    // Clear any crossfade when audio URL changes
    if (crossfadeTimeoutRef.current) {
      clearInterval(crossfadeTimeoutRef.current);
      crossfadeTimeoutRef.current = null;
    }
  }, [audioUrl]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
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
  }, [isLooping]);
  
  // Set volume on main and next tracks
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (onPlayPauseChange) onPlayPauseChange(false);
      
      // If crossfading, also pause the next track
      if (nextAudioRef.current && nextAudioRef.current.currentTime > 0) {
        nextAudioRef.current.pause();
      }
      
      toast({
        title: "Gepauzeerd",
        description: "De meditatie is gepauzeerd."
      });
    } else {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          if (onPlayPauseChange) onPlayPauseChange(true);
          
          // If crossfading was active, resume the next track too
          if (nextAudioRef.current && nextAudioRef.current.currentTime > 0) {
            nextAudioRef.current.play().catch(e => console.error("Error resuming next track:", e));
          }
          
          toast({
            title: "Speelt nu",
            description: title ? `"${title}" speelt nu` : "De meditatie speelt nu"
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
  };
  
  const handleRetry = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    setLoadError(false);
    setIsRetrying(true);
    
    setTimeout(() => {
      audio.load();
      setIsRetrying(false);
      toast({
        title: "Opnieuw laden",
        description: "Probeert audio opnieuw te laden."
      });
    }, 500);
  };
  
  const toggleLoop = () => {
    setIsLooping(!isLooping);
    toast({
      title: !isLooping ? "Herhalen aan" : "Herhalen uit",
      description: !isLooping ? "De meditatie zal blijven herhalen" : "De meditatie zal stoppen na afloop"
    });
  };
  
  const handleProgressChange = (newValue: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = newValue[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    
    // If we've moved past the crossfade point, reset it
    if (crossfadeTimeoutRef.current && (audio.duration - newTime) > 10) {
      clearInterval(crossfadeTimeoutRef.current);
      crossfadeTimeoutRef.current = null;
      
      // Reset next track if it was playing
      if (nextAudioRef.current) {
        nextAudioRef.current.pause();
        nextAudioRef.current.currentTime = 0;
        nextAudioRef.current.volume = 0;
      }
    }
  };
  
  const handleVolumeChange = (newValue: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = newValue[0];
    setVolume(newVolume);
    
    // If we're in crossfade, adjust volumes proportionally
    if (crossfadeTimeoutRef.current && nextAudioRef.current) {
      const remainingTime = audio.duration - audio.currentTime;
      const fadeProgress = Math.max(0, Math.min(1, 1 - (remainingTime / 10)));
      
      audio.volume = newVolume * (1 - fadeProgress);
      nextAudioRef.current.volume = newVolume * fadeProgress;
    } else {
      audio.volume = newVolume;
    }
  };
  
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  
  const skipTime = (amount: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = Math.min(Math.max(audio.currentTime + amount, 0), duration);
  };
  
  return (
    <div className={cn("w-full space-y-3 rounded-lg p-3 bg-card/50 shadow-sm", className)}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" crossOrigin="anonymous" />
      
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
            className="audio-player-slider"
            disabled={!isLoaded}
          />
        </div>
        <div className="text-xs w-10">{formatTime(duration)}</div>
      </div>
      
      {showControls && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => skipTime(-10)}
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full"
              disabled={!isLoaded}
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
              disabled={!isLoaded}
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
                disabled={!isLoaded}
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
