
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Plus, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Soundscape } from "@/lib/types";

interface MusicTrackCardProps {
  track: Soundscape;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  onPlay: (track: Soundscape) => void;
  onStop: () => void;
  onAddToPlaylist: (track: Soundscape) => void;
}

export const MusicTrackCard: React.FC<MusicTrackCardProps> = ({
  track,
  isPlaying,
  isCurrentTrack,
  onPlay,
  onStop,
  onAddToPlaylist
}) => {
  const handlePlayClick = () => {
    if (isCurrentTrack && isPlaying) {
      onStop();
    } else {
      onPlay(track);
    }
  };

  return (
    <div className="py-2 px-2 flex items-center hover:bg-muted/50 transition-colors rounded-md group">
      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md mr-3">
        <img 
          src={track.coverImageUrl} 
          alt={track.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/40?text=Music";
          }}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate">{track.title}</h3>
        {isCurrentTrack && isPlaying && (
          <div className="flex items-center text-xs text-primary">
            <Volume2 className="h-3 w-3 mr-1 animate-pulse" />
            <span>Nu spelend</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1 flex-shrink-0 opacity-80 group-hover:opacity-100">
        <Button 
          size="icon" 
          variant="ghost"
          onClick={handlePlayClick}
          className="h-8 w-8"
        >
          {isCurrentTrack && isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button 
          size="icon" 
          variant="ghost"
          onClick={() => onAddToPlaylist(track)}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
