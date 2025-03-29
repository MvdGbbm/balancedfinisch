
import React from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AudioControlsProps {
  isPlaying: boolean;
  progress: number;
  volume: number;
  muted: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  handleVolumeChange: (values: number[]) => void;
  error: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  progress,
  volume,
  muted,
  togglePlay,
  toggleMute,
  handleVolumeChange,
  error
}) => {
  return (
    <>
      <Progress value={progress} className="h-1 w-full" />

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={togglePlay}
          disabled={error}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleMute}
          >
            {muted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            className="w-20"
            value={[volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
          />
        </div>
      </div>
    </>
  );
};
