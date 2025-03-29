
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Music } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Soundscape } from "@/lib/types";
import { Playlist } from "@/components/playlist/types";
import { MusicTrackCard } from "./MusicTrackCard";

interface AddTrackToPlaylistButtonProps {
  playlist: Playlist;
  musicTracks: Soundscape[];
  onAddToPlaylist: (track: Soundscape, playlistId: string) => void;
  getPlaylistTracks: (playlist: Playlist) => Soundscape[];
}

export const AddTrackToPlaylistButton: React.FC<AddTrackToPlaylistButtonProps> = ({
  playlist,
  musicTracks,
  onAddToPlaylist,
  getPlaylistTracks
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get current tracks in the playlist to filter out
  const playlistTracks = getPlaylistTracks(playlist);
  const playlistTrackIds = playlistTracks.map(track => track.id);
  
  // Filter out tracks already in the playlist
  const availableTracks = musicTracks.filter(
    track => !playlistTrackIds.includes(track.id)
  );

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1"
      >
        <Plus className="h-4 w-4" />
        Track toevoegen
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Track toevoegen aan {playlist.name}</DialogTitle>
            <DialogDescription>
              Selecteer tracks om toe te voegen aan deze afspeellijst
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-2 mt-4">
            {availableTracks.length > 0 ? (
              availableTracks.map(track => (
                <div 
                  key={track.id} 
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={track.coverImageUrl} 
                        alt={track.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/40?text=Music";
                        }}
                      />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-medium text-sm truncate">{track.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.description}</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onAddToPlaylist(track, playlist.id);
                      setIsOpen(false);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Toevoegen
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Music className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Alle beschikbare tracks zijn al toegevoegd aan deze afspeellijst
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
