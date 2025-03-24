
import React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  isLoaded: boolean;
  isCrossfading: boolean;
  isLiveStream: boolean;
  onProgressChange: (newValue: number[]) => void;
  className?: string;
}

export function ProgressBar({
  currentTime,
  duration,
  isLoaded,
  isCrossfading,
  isLiveStream,
  onProgressChange,
  className
}: ProgressBarProps) {
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("w-full flex items-center space-x-2", className)}>
      <div className="text-xs w-10 text-right">{formatTime(currentTime)}</div>
      <div className="flex-grow">
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.01}
          onValueChange={onProgressChange}
          className={cn(
            "audio-player-slider",
            (isCrossfading || isLiveStream) && "cursor-wait opacity-70"
          )}
          disabled={!isLoaded || isCrossfading || isLiveStream}
        />
      </div>
      <div className="text-xs w-10">
        {isLiveStream && duration === 0 ? "LIVE" : formatTime(duration)}
      </div>
    </div>
  );
}
