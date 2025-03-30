
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, RefreshCw, Volume2, Quote } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface AudioControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onToggleLoop: () => void;
  isLooping: boolean;
  volume: number;
  onVolumeChange: (newValue: number[]) => void;
  hasNextTrack?: boolean;
  isLiveStream?: boolean;
  showQuote?: boolean;
  onToggleQuote?: () => void;
  hasQuote?: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  onToggleLoop,
  isLooping,
  volume,
  onVolumeChange,
  hasNextTrack = false,
  isLiveStream = false,
  showQuote = false,
  onToggleQuote,
  hasQuote = false
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {onPrevious && (
          <Button
            onClick={onPrevious}
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            disabled={isLiveStream}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          onClick={onPlayPause}
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
        
        {onNext && (
          <Button
            onClick={onNext}
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            disabled={isLiveStream || !hasNextTrack}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        )}
        
        <div className="flex items-center ml-2 space-x-1">
          <Button
            onClick={onToggleLoop}
            size="icon"
            variant={isLooping ? "default" : "ghost"}
            className={cn(
              "h-8 w-8 rounded-full transition-colors",
              isLooping && "bg-primary text-primary-foreground"
            )}
            disabled={isLiveStream}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          {hasQuote && (
            <Button
              onClick={onToggleQuote}
              size="icon"
              variant={showQuote ? "default" : "ghost"}
              className={cn(
                "h-8 w-8 rounded-full transition-colors",
                showQuote && "bg-primary text-primary-foreground"
              )}
            >
              <Quote className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Volume2 className="h-4 w-4 text-muted-foreground" />
        <Slider
          value={[volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={onVolumeChange}
          className="w-24"
        />
      </div>
    </div>
  );
};
