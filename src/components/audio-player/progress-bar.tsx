
import React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { formatTime } from "./utils";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  isLoaded: boolean;
  isCrossfading: boolean;
  isLiveStream: boolean;
  handleProgressChange: (newValue: number[]) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  isLoaded,
  isCrossfading,
  isLiveStream,
  handleProgressChange
}) => {
  return (
    <div className="w-full flex items-center space-x-2">
      <div className="text-xs w-10 text-right">{formatTime(currentTime)}</div>
      <div className="flex-grow">
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.01}
          onValueChange={handleProgressChange}
          className={cn(
            "audio-player-slider",
            (isCrossfading || isLiveStream) && "cursor-wait opacity-70"
          )}
          disabled={!isLoaded || isCrossfading || isLiveStream}
        />
      </div>
      <div className="text-xs w-10">
        {isLiveStream ? "LIVE" : formatTime(duration)}
      </div>
    </div>
  );
};
