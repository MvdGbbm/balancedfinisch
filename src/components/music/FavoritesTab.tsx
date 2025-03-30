
import React from "react";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Soundscape } from "@/lib/types";
import { TrackCard } from "./TrackCard";

interface FavoritesTabProps {
  favoritesTracks: Soundscape[];
  onShuffleMusic: () => void;
  onAddToPlaylist: (track: Soundscape, playlist: any) => void;
  onRemoveTrack: (track: Soundscape) => void;
  onPlaylistCreation: () => void;
}

export const FavoritesTab: React.FC<FavoritesTabProps> = ({
  favoritesTracks,
  onShuffleMusic,
  onAddToPlaylist,
  onRemoveTrack,
  onPlaylistCreation
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center mb-4">
        <Button variant="outline" size="sm" onClick={onShuffleMusic}>
          <Shuffle className="h-4 w-4 mr-1" />
          Shuffle
        </Button>
      </div>
      
      <div className="space-y-2">
        {favoritesTracks.length > 0 ? (
          favoritesTracks.map(track => (
            <TrackCard 
              key={track.id} 
              track={track} 
              onAddToPlaylist={onAddToPlaylist}
              onRemoveTrack={onRemoveTrack}
              onPlaylistCreation={onPlaylistCreation}
              showRemoveButton={true}
            />
          ))
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            Geen favorieten gevonden
          </p>
        )}
      </div>
    </div>
  );
};
