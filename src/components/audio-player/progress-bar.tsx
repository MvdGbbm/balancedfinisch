
import React from "react";
import { Slider } from "@/components/ui/slider";
import { formatTime } from "./utils";

interface ProgressBarProps {
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  duration,
  currentTime,
  onSeek,
}) => {
  const percentComplete = duration ? (currentTime / duration) * 100 : 0;

  const handleSeek = (values: number[]) => {
    onSeek(values[0]);
  };

  // Handle special cases for duration
  const durationDisplay = isNaN(duration) || duration === Infinity ? 0 : duration;

  return (
    <div className="w-full space-y-1">
      <Slider
        value={[currentTime]}
        max={duration || 1}
        step={0.1}
        onValueChange={handleSeek}
        aria-label="Seek time"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(durationDisplay)}</span>
      </div>
    </div>
  );
};
