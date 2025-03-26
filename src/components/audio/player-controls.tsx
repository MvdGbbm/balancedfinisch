
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerControlsProps {
  isPlaying: boolean;
  isLoaded: boolean;
  loadError: boolean;
  isLooping: boolean;
  isCrossfading: boolean;
  isLiveStream: boolean;
  togglePlay: () => void;
  toggleLoop: () => void;
  skipTime: (seconds: number) => void;
  className?: string;
}

export function PlayerControls({
  isPlaying,
  isLoaded,
  loadError,
  isLooping,
  isCrossfading,
  isLiveStream,
  togglePlay,
  toggleLoop,
  skipTime,
  className
}: PlayerControlsProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
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
  );
}
