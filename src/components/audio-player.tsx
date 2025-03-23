import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, SkipBack, SkipForward, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { quotes } from "@/data/quotes";
import { toast } from "sonner";

interface AudioPlayerProps {
  audioUrl: string;
  showControls?: boolean;
  showTitle?: boolean;
  title?: string;
  className?: string;
  onEnded?: () => void;
  customSoundscapeSelector?: React.ReactNode;
  showQuote?: boolean;
}

export function AudioPlayer({ 
  audioUrl, 
  showControls = true, 
  showTitle = false,
  title,
  className, 
  onEnded,
  customSoundscapeSelector,
  showQuote = false
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLooping, setIsLooping] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  // Random quote for display
  const [randomQuote] = useState(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const setAudioData = () => {
      setDuration(audio.duration);
      setAudioError(null);
    };
    
    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      if (!isLooping) {
        setIsPlaying(false);
        if (onEnded) onEnded();
      }
    };

    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setAudioError("Kon audio niet laden. Controleer of het bestand bestaat.");
      setIsPlaying(false);
      toast.error("Kon audio niet laden. Controleer of het bestand bestaat.");
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
    };
  }, [onEnded, volume, isLooping]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Reset current time and error state when audio URL changes
    setCurrentTime(0);
    setAudioError(null);
    
    // Add a small delay to let the audio load before trying to play
    if (isPlaying) {
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Playback started successfully
          })
          .catch(error => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
            setAudioError("Kon audio niet afspelen. Probeer het later opnieuw.");
            toast.error("Kon audio niet afspelen. Probeer het later opnieuw.");
          });
      }
    }
  }, [audioUrl, isPlaying]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.loop = isLooping;
    
    if (isLooping) {
      const handleTimeUpdate = () => {
        if (audio.duration > 0 && audio.currentTime > audio.duration - 0.2) {
          const currentPlaybackRate = audio.playbackRate;
          audio.currentTime = 0;
          audio.playbackRate = currentPlaybackRate;
        }
      };
      
      audio.addEventListener("timeupdate", handleTimeUpdate);
      
      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, [isLooping]);
  
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Error playing audio:", error);
            setAudioError("Kon audio niet afspelen. Probeer het later opnieuw.");
            toast.error("Kon audio niet afspelen. Probeer het later opnieuw.");
          });
      }
    }
  };
  
  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };
  
  const handleProgressChange = (newValue: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = newValue[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const handleVolumeChange = (newValue: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = newValue[0];
    audio.volume = newVolume;
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
  
  return (
    <div className={cn("w-full space-y-3 rounded-lg p-3 bg-card/50 shadow-sm", className)}>
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        crossOrigin="anonymous"
      />
      
      {showTitle && title && (
        <h3 className="text-lg font-medium">{title}</h3>
      )}
      
      {audioError && (
        <div className="bg-red-100 text-red-700 p-2 rounded-md text-sm mb-2">
          {audioError}
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
            disabled={!!audioError}
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
              disabled={!!audioError}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={togglePlay}
              size="icon"
              variant="outline"
              className="h-10 w-10 rounded-full"
              disabled={!!audioError}
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
              disabled={!!audioError}
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
                disabled={!!audioError}
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
              disabled={!!audioError}
            />
          </div>
        </div>
      )}
    </div>
  );
}
