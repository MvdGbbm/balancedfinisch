
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";
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
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
        <img 
          src={track.coverImageUrl} 
          alt={track.title}
          className="object-cover w-full h-full"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/100x100?text=No+Image";
          }}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm line-clamp-1">{track.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {track.description}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {track.tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs px-1 py-0 h-4">
              {tag}
            </Badge>
          ))}
          {track.tags.length > 2 && (
            <span className="text-xs text-muted-foreground">+{track.tags.length - 2}</span>
          )}
        </div>
      </div>
      
      {isCurrentTrack && isPlaying && (
        <Volume2 className="h-4 w-4 text-primary animate-pulse flex-shrink-0" />
      )}
      
      <div className="flex-shrink-0">
        <Button 
          size="icon" 
          variant={isCurrentTrack && isPlaying ? "default" : "ghost"}
          onClick={handlePlayClick}
          className="h-8 w-8"
        >
          {isCurrentTrack && isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
