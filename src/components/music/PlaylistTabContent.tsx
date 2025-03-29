
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Play, Square } from "lucide-react";
import { Playlist } from "@/components/playlist/types";
import { Soundscape } from "@/lib/types";
import { PlaylistCard } from "./PlaylistCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MusicTrackCard } from "./MusicTrackCard";

interface PlaylistTabContentProps {
  playlists: Playlist[];
  selectedPlaylist: Playlist | null;
  isPlaying: boolean;
  currentTrack: Soundscape | null;
  onCreatePlaylist: () => void;
  onPlayPlaylist: (playlist: Playlist) => void;
  onStopPlaylist: () => void;
  onRemoveTrack: (trackId: string, playlistId: string) => void;
  getPlaylistTracks: (playlist: Playlist) => Soundscape[];
}

export const PlaylistTabContent: React.FC<PlaylistTabContentProps> = ({
  playlists,
  selectedPlaylist,
  isPlaying,
  currentTrack,
  onCreatePlaylist,
  onPlayPlaylist,
  onStopPlaylist,
  onRemoveTrack,
  getPlaylistTracks
}) => {
  const [viewingPlaylist, setViewingPlaylist] = useState<Playlist | null>(null);
  
  const handleBackToPlaylists = () => {
    setViewingPlaylist(null);
  };
  
  const playlistTracks = viewingPlaylist ? getPlaylistTracks(viewingPlaylist) : [];
  
  if (viewingPlaylist) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              onClick={handleBackToPlaylists}
              className="mb-2"
            >
              ← Terug naar afspeellijsten
            </Button>
            <h2 className="text-xl font-semibold">{viewingPlaylist.name}</h2>
            <p className="text-sm text-muted-foreground">{playlistTracks.length} nummers</p>
          </div>
          <Button
            variant={selectedPlaylist?.id === viewingPlaylist.id && isPlaying ? "destructive" : "secondary"}
            size="sm"
            onClick={() => {
              if (selectedPlaylist?.id === viewingPlaylist.id && isPlaying) {
                onStopPlaylist();
              } else {
                onPlayPlaylist(viewingPlaylist);
              }
            }}
          >
            {selectedPlaylist?.id === viewingPlaylist.id && isPlaying ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Afspelen
              </>
            )}
          </Button>
        </div>
        
        {playlistTracks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Deze afspeellijst is leeg. Voeg nummers toe vanaf het "Muziek" tabblad.
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
              {playlistTracks.map((track) => (
                <MusicTrackCard
                  key={track.id}
                  track={track}
                  isPlaying={isPlaying && currentTrack?.id === track.id}
                  isInPlaylist={true}
                  onPlayPause={() => {
                    // Handled directly by the playlist player
                  }}
                  onRemoveFromPlaylist={() => onRemoveTrack(track.id, viewingPlaylist.id)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Afspeellijsten</h2>
        <Button onClick={onCreatePlaylist}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nieuwe afspeellijst
        </Button>
      </div>
      
      {playlists.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Je hebt nog geen afspeellijsten gemaakt.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              isActive={selectedPlaylist?.id === playlist.id && isPlaying}
              onView={() => setViewingPlaylist(playlist)}
              onPlay={() => {
                if (selectedPlaylist?.id === playlist.id && isPlaying) {
                  onStopPlaylist();
                } else {
                  onPlayPlaylist(playlist);
                }
              }}
              trackCount={playlist.tracks.length}
            />
          ))}
        </div>
      )}
    </div>
  );
};
