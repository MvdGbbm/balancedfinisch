
import React from "react";
import { Soundscape } from "@/lib/types";
import { MusicTrackCard } from "./MusicTrackCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MusicTabContentProps {
  tracks: Soundscape[];
  playlists: any[];
  onPreviewTrack: (track: Soundscape) => void;
  onAddToPlaylist: (track: Soundscape, playlistId: string) => void;
  isPlaying: boolean;
  currentTrack: Soundscape | null;
  previewTrack: Soundscape | null;
}

export const MusicTabContent: React.FC<MusicTabContentProps> = ({
  tracks,
  playlists,
  onPreviewTrack,
  onAddToPlaylist,
  isPlaying,
  currentTrack,
  previewTrack
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Muziek Bibliotheek</h2>
      
      {tracks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Geen muziek beschikbaar.
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {tracks.map((track) => (
              <MusicTrackCard
                key={track.id}
                track={track}
                isPlaying={isPlaying && (
                  (currentTrack?.id === track.id) || 
                  (previewTrack?.id === track.id)
                )}
                onPlayPause={() => onPreviewTrack(track)}
                onAddToPlaylist={(playlistId) => onAddToPlaylist(track, playlistId)}
                playlists={playlists}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
