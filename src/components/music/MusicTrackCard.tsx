
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
    <Card className="overflow-hidden border-0 bg-background shadow-none hover:bg-muted/50 transition-colors">
      <CardContent className="p-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
            <img 
              src={track.coverImageUrl} 
              alt={track.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/48?text=Music";
              }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{track.title}</h3>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {track.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {track.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">+{track.tags.length - 2}</span>
              )}
            </div>
          </div>
          
          <div className="flex gap-1 flex-shrink-0">
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
        
        {isCurrentTrack && isPlaying && (
          <div className="mt-1 flex items-center text-xs text-primary">
            <Volume2 className="h-3 w-3 mr-1 animate-pulse" />
            <span>Nu spelend</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
