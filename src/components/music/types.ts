
import { Soundscape } from "@/lib/types";

export interface MusicTrackProps {
  track: Soundscape;
  isSelected: boolean;
  onPreview: (track: Soundscape) => void;
  isPlaying: boolean;
  onAddToPlaylist: (track: Soundscape) => void;
}

export interface PlaylistTrackProps {
  track: Soundscape;
  index: number;
  onRemove: (trackId: string, playlistId: string) => void;
  playlistId: string;
}
