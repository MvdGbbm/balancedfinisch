
import React from "react";
import { cn } from "@/lib/utils";
import { Play, Pause, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Track } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

interface TrackItemProps {
  track: Track;
  isPlaying?: boolean;
  isActive?: boolean;
  onPlay: (track: Track) => void;
  onPause: () => void;
  className?: string;
}

export function TrackItem({ 
  track, 
  isPlaying, 
  isActive,
  onPlay, 
  onPause,
  className 
}: TrackItemProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-2 rounded-md group",
        isActive ? "bg-secondary" : "hover:bg-secondary/50",
        className
      )}
    >
      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
        {track.coverImageUrl ? (
          <img 
            src={track.coverImageUrl} 
            alt={track.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-secondary">
            <Music className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <div className="flex-grow min-w-0">
        <h4 className={cn(
          "font-medium truncate",
          isActive && "text-primary"
        )}>
          {track.title}
        </h4>
        <p className="text-xs text-muted-foreground truncate">
          {track.artist}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDuration(track.duration)}
        </span>
        
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100"
          onClick={() => isPlaying ? onPause() : onPlay(track)}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
