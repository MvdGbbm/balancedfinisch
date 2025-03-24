
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
    if (isNaN(time) || time < 0) return "0:00";
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  
  // Make sure we have valid values for the slider
  const validDuration = isNaN(duration) || duration <= 0 ? 100 : duration;
  const validCurrentTime = isNaN(currentTime) || currentTime < 0 ? 0 : 
                         (currentTime > validDuration ? validDuration : currentTime);

  return (
    <div className={cn("w-full flex items-center space-x-2", className)}>
      <div className="text-xs w-10 text-right">{formatTime(validCurrentTime)}</div>
      <div className="flex-grow">
        <Slider
          value={[validCurrentTime]}
          min={0}
          max={validDuration}
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
        {isLiveStream && (duration === 0 || isNaN(duration)) ? "LIVE" : formatTime(validDuration)}
      </div>
    </div>
  );
}
