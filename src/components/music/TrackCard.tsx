
import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlaylistSelector } from "@/components/playlist/playlist-selector";
import { Soundscape } from "@/lib/types";
import { Playlist } from "@/components/playlist/types";

interface TrackCardProps {
  track: Soundscape;
  onAddToPlaylist: (track: Soundscape, playlist: Playlist) => void;
  onPlaylistCreation: () => void;
  onRemoveTrack?: (track: Soundscape) => void;
  showRemoveButton?: boolean;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  onAddToPlaylist,
  onPlaylistCreation,
  onRemoveTrack,
  showRemoveButton = false
}) => {
  return (
    <Card key={track.id} className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded bg-cover bg-center flex-shrink-0" 
            style={{ backgroundImage: `url(${track.coverImageUrl})` }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{track.title}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {track.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PlaylistSelector 
              playlists={[]}  // This will be passed from the parent component
              onSelectPlaylist={(playlist) => onAddToPlaylist(track, playlist)}
              onCreateNew={onPlaylistCreation}
            />
            
            {showRemoveButton && onRemoveTrack && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onRemoveTrack(track)}
                className="text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
