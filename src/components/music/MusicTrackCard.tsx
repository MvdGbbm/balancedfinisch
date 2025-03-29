
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Soundscape } from "@/lib/types";
import { PlaylistSelector } from "@/components/playlist/playlist-selector";

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
  const [showPlaylistSelector, setShowPlaylistSelector] = React.useState(false);
  
  const handlePlayClick = () => {
    if (isCurrentTrack && isPlaying) {
      onStop();
    } else {
      onPlay(track);
    }
  };

  return (
    <Card className="overflow-hidden hover:bg-accent/50 transition-colors">
      <CardContent className="p-3 flex items-center gap-3">
        <div className="relative h-12 w-12 flex-shrink-0 rounded overflow-hidden">
          <img 
            src={track.coverImageUrl} 
            alt={track.title}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/48?text=No+Image";
            }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm line-clamp-1">{track.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {track.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            {track.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs py-0 px-1.5">
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
            variant={isCurrentTrack && isPlaying ? "default" : "outline"}
            onClick={handlePlayClick}
            className="h-8 w-8"
          >
            {isCurrentTrack && isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </Button>
          
          <Button 
            size="icon" 
            variant="outline"
            onClick={() => setShowPlaylistSelector(true)}
            className="h-8 w-8"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <PlaylistSelector
          open={showPlaylistSelector}
          onOpenChange={setShowPlaylistSelector}
          playlists={[]} /* This will be passed from parent */
          onSelect={(playlistId) => {
            onAddToPlaylist(track);
            setShowPlaylistSelector(false);
          }}
          onCreateNew={() => {
            setShowPlaylistSelector(false);
            /* This will be handled by parent */
          }}
        />
      </CardContent>
    </Card>
  );
};
