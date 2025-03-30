
import React from "react";
import { Soundscape } from "@/lib/types";
import { MusicTrackCard } from "./music-track-card";
import { Playlist } from "@/components/playlist/types";

interface MusicTracksProps {
  tracks: Soundscape[];
  isPlaying: boolean;
  previewTrack: Soundscape | null;
  currentTrack: Soundscape | null;
  onPlayTrack: (track: Soundscape) => void;
  onAddToPlaylist: (track: Soundscape, playlist: Playlist) => void;
  onToggleFavorite: (track: Soundscape) => void;
  playlists: Playlist[];
  onCreatePlaylist: () => void;
}

export const MusicTracks: React.FC<MusicTracksProps> = ({
  tracks,
  isPlaying,
  previewTrack,
  currentTrack,
  onPlayTrack,
  onAddToPlaylist,
  onToggleFavorite,
  playlists,
  onCreatePlaylist,
}) => {
  if (tracks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Geen muziek tracks gevonden</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {tracks.map((track) => (
        <MusicTrackCard
          key={track.id}
          track={track}
          isPlaying={(previewTrack?.id === track.id || currentTrack?.id === track.id) && isPlaying}
          onPlayTrack={onPlayTrack}
          onAddToPlaylist={onAddToPlaylist}
          onToggleFavorite={onToggleFavorite}
          playlists={playlists}
          onCreatePlaylist={onCreatePlaylist}
        />
      ))}
    </div>
  );
};
