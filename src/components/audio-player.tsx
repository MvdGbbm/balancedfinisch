
import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  audioUrl: string;
  showControls?: boolean;
  className?: string;
  onEnded?: () => void;
}

export function AudioPlayer({ audioUrl, showControls = true, className, onEnded }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  // Set up audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Set up event listeners
    const setAudioData = () => {
      setDuration(audio.duration);
    };
    
    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };
    
    // Events
    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);
    
    // Set initial volume
    audio.volume = volume;
    
    // Clean up
    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onEnded, volume]);
  
  // Play/Pause
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play()
        .catch(error => {
          console.error("Error playing audio:", error);
        });
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Seek
  const handleProgressChange = (newValue: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = newValue[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  // Volume change
  const handleVolumeChange = (newValue: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = newValue[0];
    audio.volume = newVolume;
    setVolume(newVolume);
  };
  
  // Format time
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  
  // Skip forward/backward
  const skipTime = (amount: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = Math.min(Math.max(audio.currentTime + amount, 0), duration);
  };
  
  return (
    <div className={cn("w-full rounded-lg p-4 glass-morphism", className)}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="flex flex-col space-y-2">
        {/* Progress bar */}
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
            />
          </div>
          <div className="text-xs w-10">{formatTime(duration)}</div>
        </div>
        
        {/* Controls */}
        {showControls && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => skipTime(-10)}
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={togglePlay}
                size="icon"
                variant="outline"
                className="h-10 w-10 rounded-full"
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
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Volume control */}
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
    </div>
  );
}
