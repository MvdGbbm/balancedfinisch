
import React, { useRef } from "react";
import { formatTime } from "./utils";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  isLiveStream?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  currentTime, 
  duration, 
  onSeek,
  isLiveStream = false
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLiveStream) return;
    
    const progressBar = progressBarRef.current;
    if (!progressBar) return;
    
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const width = rect.width;
    
    const seekPercentage = offsetX / width;
    const seekTime = duration * seekPercentage;
    
    onSeek(seekTime);
  };
  
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div 
        className={`h-2 bg-secondary relative rounded-full cursor-pointer overflow-hidden ${isLiveStream ? 'opacity-50 cursor-not-allowed' : ''}`}
        ref={progressBarRef}
        onClick={handleSeek}
      >
        <div 
          className="absolute h-full bg-primary transition-all duration-100"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {!isLiveStream && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      )}
      
      {isLiveStream && (
        <div className="flex justify-center">
          <span className="text-xs text-red-500 font-medium animate-pulse">
            LIVE STREAM
          </span>
        </div>
      )}
    </div>
  );
};
