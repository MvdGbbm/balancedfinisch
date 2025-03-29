
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Plus } from "lucide-react";
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
    <Card className="overflow-hidden">
      <div className="relative aspect-video w-full">
        <img 
          src={track.coverImageUrl} 
          alt={track.title}
          className="object-cover w-full h-full"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/400x225?text=No+Image";
          }}
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-bold text-lg line-clamp-1">{track.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {track.description}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {track.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              size="icon" 
              variant={isCurrentTrack && isPlaying ? "default" : "outline"}
              onClick={handlePlayClick}
              className={isCurrentTrack && isPlaying ? "bg-primary" : ""}
            >
              {isCurrentTrack && isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button 
              size="icon" 
              variant="outline"
              onClick={() => onAddToPlaylist(track)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
