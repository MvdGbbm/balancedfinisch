
import React, { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat,
  Shuffle,
  ListMusic,
  Heart,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Track } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";

interface MusicPlayerProps {
  track?: Track | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  isRepeat: boolean;
  isShuffle: boolean;
  className?: string;
  onAudioElementReady?: (audioElement: HTMLAudioElement) => void;
}

export function MusicPlayer({
  track,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onToggleRepeat,
  onToggleShuffle,
  isRepeat,
  isShuffle,
  className,
  onAudioElementReady
}: MusicPlayerProps) {
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>();
  
  useEffect(() => {
    if (audioRef.current && onAudioElementReady) {
      onAudioElementReady(audioRef.current);
    }
  }, [onAudioElementReady]);
  
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    const handleLoadedData = () => {
      setDuration(audio.duration);
      if (isPlaying) audio.play();
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        onNext();
      }
    };
    
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      cancelAnimationFrame(animationRef.current!);
    };
  }, [isPlaying, isRepeat, onNext]);
  
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        onPause();
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, track, onPause]);
  
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);
  
  const handleProgressChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    
    if (!isPlaying) {
      onPlay();
    }
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const handleLike = () => {
    setIsLiked(!isLiked);
  };
  
  return (
    <div className={cn("w-full bg-card shadow-md rounded-lg p-4", className)}>
      <audio
        ref={audioRef}
        src={track?.audioUrl}
        preload="metadata"
      />
      
      <div className="flex flex-col space-y-4">
        {track && (
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
              {track.coverImageUrl ? (
                <img 
                  src={track.coverImageUrl} 
                  alt={track.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-secondary flex items-center justify-center">
                  <ListMusic className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="flex-grow min-w-0">
              <h3 className="font-medium truncate">{track.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "h-8 w-8 rounded-full",
                  isLiked && "text-red-500"
                )}
                onClick={handleLike}
              >
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDuration(currentTime)}</span>
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.01}
              className="flex-grow"
              onValueChange={handleProgressChange}
            />
            <span>{formatDuration(duration)}</span>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-8 w-8 rounded-full",
                isShuffle && "text-primary"
              )}
              onClick={onToggleShuffle}
            >
              <Shuffle className="h-4 w-4" />
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full"
              onClick={onPrevious}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-primary text-primary-foreground"
              onClick={isPlaying ? onPause : onPlay}
              disabled={!track}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full"
              onClick={onNext}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-8 w-8 rounded-full",
                isRepeat && "text-primary"
              )}
              onClick={onToggleRepeat}
            >
              <Repeat className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <div 
              className="relative" 
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full"
                onClick={toggleMute}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              
              {showVolumeSlider && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-card rounded-md shadow-md w-36">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
