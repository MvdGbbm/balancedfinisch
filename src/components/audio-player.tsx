
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
  isStream?: boolean; // Add isStream property for radio streams
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
  isStream = false // Default to false
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
  const [hasTransitionedToNext, setHasTransitionedToNext] = useState(false);
  const [lazyLoaded, setLazyLoaded] = useState(false);
  const { toast } = useToast();
  
  const [randomQuote] = useState(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const crossfadeTimeoutRef = useRef<number | null>(null);
  
  const CROSSFADE_DURATION = 5; // Duration of crossfade in seconds

  const handleAudioData = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (!isStream) {
      setDuration(audio.duration);
    } else {
      setDuration(0);
    }
    setIsLoaded(true);
    setLoadError(false);
    setLazyLoaded(true);
    
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
      title: isStream ? "Stream geladen" : "Audio geladen",
      description: isStream 
        ? "De stream is klaar om af te spelen." 
        : "De meditatie is klaar om af te spelen."
    });
  };
  
  const handleAudioTime = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (!hasTransitionedToNext || !isCrossfading) {
      setCurrentTime(audio.currentTime);
    }
  };
  
  const handleAudioEnded = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
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
  
  const handleAudioError = (e: Event) => {
    console.error("Error loading audio:", e);
    setLoadError(true);
    setIsLoaded(false);
    setLazyLoaded(false);
    
    const audio = audioRef.current;
    if (!audio) return;
    
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
  
  useEffect(() => {
    if (isPlayingExternal !== undefined && audioRef.current) {
      if (isPlayingExternal && !isPlaying && (isLoaded || isStream)) {
        if (isStream && !lazyLoaded) {
          // For streams, we need to first load it when play is requested
          loadStreamAudio();
        } else {
          audioRef.current.play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch(error => {
              console.error("Error playing audio:", error);
            });
        }
      } else if (!isPlayingExternal && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isPlayingExternal, isPlaying, isLoaded, isStream, lazyLoaded]);
  
  useEffect(() => {
    setHasTransitionedToNext(false);
  }, [audioUrl]);
  
  useEffect(() => {
    if (!nextAudioUrl || !isPlaying || isCrossfading) return;
    
    const audio = audioRef.current;
    const nextAudio = nextAudioRef.current;
    
    if (!audio || !nextAudio || !isLoaded || duration === 0) return;
    
    if (isStream) return;
    
    if (duration - currentTime <= CROSSFADE_DURATION && duration > CROSSFADE_DURATION) {
      if (crossfadeTimeoutRef.current) return;
      
      setIsCrossfading(true);
      console.info("Starting crossfade");
      
      nextAudio.volume = 0;
      nextAudio.currentTime = 0;
      
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
            if (onEnded) {
              onEnded();
              setHasTransitionedToNext(true);
              setCurrentTime(0);
              setDuration(nextAudio.duration || 0);
            }
            crossfadeTimeoutRef.current = null;
            setIsCrossfading(false);
          }, timeLeft * 1000);
        })
        .catch(error => {
          console.error("Error starting crossfade:", error);
          setIsCrossfading(false);
        });
    }
  }, [currentTime, duration, isLoaded, isPlaying, nextAudioUrl, onCrossfadeStart, onEnded, volume, isCrossfading, isStream]);
  
  const loadAudioFile = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.addEventListener("loadeddata", handleAudioData);
    audio.addEventListener("timeupdate", handleAudioTime);
    audio.addEventListener("ended", handleAudioEnded);
    audio.addEventListener("error", handleAudioError);
    
    audio.volume = volume;
    audio.loop = isLooping;
    
    console.log("Loading audio file:", audioUrl, "isStream:", isStream);
    if (!isStream || (isStream && lazyLoaded)) {
      audio.load();
    }
  };
  
  const loadStreamAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    console.log("Lazy loading stream:", audioUrl);
    setLazyLoaded(true);
    
    // Set the src attribute now that we're about to play
    audio.src = audioUrl;
    audio.load();
    
    // Once loaded, play
    audio.addEventListener("loadeddata", () => {
      setIsLoaded(true);
      setLoadError(false);
      audio.play()
        .then(() => {
          setIsPlaying(true);
          if (onPlayPauseChange) onPlayPauseChange(true);
          toast({
            title: "Stream speelt nu",
            description: title ? `"${title}" speelt nu` : "De stream speelt nu"
          });
        })
        .catch(error => {
          console.error("Error playing stream:", error);
          setLoadError(true);
          toast({
            variant: "destructive",
            title: "Fout bij afspelen",
            description: "Kon de stream niet afspelen. Probeer het later opnieuw."
          });
        });
    }, { once: true });
    
    audio.addEventListener("error", () => {
      console.error("Error loading stream:", audioUrl);
      setLoadError(true);
      setIsLoaded(false);
      toast({
        variant: "destructive",
        title: "Fout bij laden",
        description: "Kon de stream niet laden. Controleer de URL."
      });
      if (onError) onError();
    }, { once: true });
  };
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // For regular audio files, load immediately
    // For streams, don't load until play is requested
    if (!isStream) {
      loadAudioFile();
    }
    
    return () => {
      // Properly clean up event listeners
      if (audio) {
        audio.removeEventListener("loadeddata", handleAudioData);
        audio.removeEventListener("timeupdate", handleAudioTime);
        audio.removeEventListener("ended", handleAudioEnded);
        audio.removeEventListener("error", handleAudioError);
      }
      
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current);
        crossfadeTimeoutRef.current = null;
      }
    };
  }, [audioUrl, isStream]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    setCurrentTime(0);
    setIsLoaded(false);
    setLoadError(false);
    setIsRetrying(false);
    setIsCrossfading(false);
    setHasTransitionedToNext(false);
    setLazyLoaded(false);
    
    if (crossfadeTimeoutRef.current) {
      clearTimeout(crossfadeTimeoutRef.current);
      crossfadeTimeoutRef.current = null;
    }
    
    if (!isStream) {
      audio.load();
    }
  }, [audioUrl, isStream]);
  
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
        description: isStream ? "De stream is gepauzeerd." : "De meditatie is gepauzeerd."
      });
    } else {
      // For streams, we need to load it first if not loaded yet
      if (isStream && !lazyLoaded) {
        loadStreamAudio();
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
              title: "Speelt nu",
              description: title ? `"${title}" speelt nu` : isStream ? "De stream speelt nu" : "De meditatie speelt nu"
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
    
    setTimeout(() => {
      if (isStream) {
        loadStreamAudio();
      } else {
        audio.load();
      }
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
    
    if (isCrossfading && duration - newTime > CROSSFADE_DURATION) {
      setIsCrossfading(false);
      setHasTransitionedToNext(false);
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
    if (!audio) return;
    
    audio.currentTime = Math.min(Math.max(audio.currentTime + amount, 0), duration);
  };
  
  const displayCurrentTime = hasTransitionedToNext && isCrossfading && nextAudioRef.current 
    ? nextAudioRef.current.currentTime
    : currentTime;
    
  const displayDuration = hasTransitionedToNext && isCrossfading && nextAudioRef.current
    ? nextAudioRef.current.duration || 0
    : duration;
  
  return (
    <div className={cn("w-full space-y-3 rounded-lg p-3 bg-card/50 shadow-sm", className)}>
      {!isStream || (isStream && lazyLoaded) ? (
        <audio ref={audioRef} src={isStream && !lazyLoaded ? "" : audioUrl} preload={isStream ? "none" : "metadata"} crossOrigin="anonymous" />
      ) : (
        <audio ref={audioRef} preload="none" crossOrigin="anonymous" />
      )}
      {nextAudioUrl && <audio ref={nextAudioRef} src={nextAudioUrl} preload="metadata" crossOrigin="anonymous" />}
      
      {showTitle && title && (
        <h3 className="text-lg font-medium">{title}</h3>
      )}
      
      {loadError && (
        <div className="p-2 rounded-md bg-destructive/10 text-destructive text-center">
          <p className="text-sm">Er is een probleem met het laden van de {isStream ? "stream" : "audio"}.</p>
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
        <div className="text-xs w-10 text-right">
          {hasTransitionedToNext ? "0:00" : formatTime(displayCurrentTime)}
        </div>
        <div className="flex-grow">
          <Slider
            value={[hasTransitionedToNext ? 0 : displayCurrentTime]}
            min={0}
            max={displayDuration || 100}
            step={0.01}
            onValueChange={handleProgressChange}
            className={cn(
              "audio-player-slider",
              (isCrossfading || isStream) && "cursor-wait opacity-70"
            )}
            disabled={!isLoaded || isCrossfading || isStream}
          />
        </div>
        <div className="text-xs w-10">
          {isStream ? "LIVE" : formatTime(displayDuration)}
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
              disabled={!isLoaded || isCrossfading || isStream}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={togglePlay}
              size="icon"
              variant="outline"
              className="h-10 w-10 rounded-full"
              disabled={!isLoaded && !loadError && (isStream ? !lazyLoaded : true)}
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
              disabled={!isLoaded || isCrossfading || isStream}
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
