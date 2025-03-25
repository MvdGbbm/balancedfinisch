
import React from "react";
import { Soundscape } from "@/lib/types";
import { MusicTrack } from "./music-track";

interface MusicListProps {
  musicTracks: Soundscape[];
  currentTrack: Soundscape | null;
  previewTrack: Soundscape | null;
  isPlaying: boolean;
  onPreviewTrack: (track: Soundscape) => void;
  onAddToPlaylist: (track: Soundscape, playlist: any) => void;
  playlists: any[];
  onShowPlaylistCreator: () => void;
}

export const MusicList: React.FC<MusicListProps> = ({
  musicTracks,
  currentTrack,
  previewTrack,
  isPlaying,
  onPreviewTrack,
  onAddToPlaylist,
  playlists,
  onShowPlaylistCreator
}) => {
  return (
    <div className="space-y-4">
      {musicTracks.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {musicTracks.map((track) => (
            <MusicTrack
              key={track.id}
              track={track}
              isSelected={currentTrack?.id === track.id}
              onPreview={onPreviewTrack}
              isPlaying={previewTrack?.id === track.id && isPlaying}
              onAddToPlaylist={(track) => {
                // This is a wrapper that will open the playlist selector
                // The actual addition happens in the parent component
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Geen muziek tracks gevonden</p>
        </div>
      )}
    </div>
  );
};
