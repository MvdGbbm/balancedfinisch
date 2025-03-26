
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, RefreshCw, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface AudioControlsProps {
  isPlaying: boolean;
  togglePlay: () => void;
  skipTime: (amount: number) => void;
  isLoaded: boolean;
  isLooping: boolean;
  toggleLoop: () => void;
  isCrossfading: boolean;
  isLiveStream: boolean;
  volume: number;
  handleVolumeChange: (newValue: number[]) => void;
  loadError: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  togglePlay,
  skipTime,
  isLoaded,
  isLooping,
  toggleLoop,
  isCrossfading,
  isLiveStream,
  volume,
  handleVolumeChange,
  loadError
}) => {
  return (
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
  );
};
