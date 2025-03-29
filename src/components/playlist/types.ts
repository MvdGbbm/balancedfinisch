
import { Soundscape } from "@/lib/types";

export interface Playlist {
  id: string;
  name: string;
  tracks: {
    trackId: string;
    added: string;
  }[];
  createdAt: string;
}

export interface PlaylistProps {
  playlist: Playlist;
  soundscapes: Soundscape[];
  currentTrack: Soundscape | null;
  isPlaying: boolean;
  selectedPlaylist: Playlist | null;
  onPlayPlaylist: (playlist: Playlist) => void;
  onStopPlaylist: () => void;
  onRemoveFromPlaylist: (trackId: string, playlistId: string) => void;
}

export interface PlaylistSelectorProps {
  playlists: Playlist[];
  onSelectPlaylist: (playlist: Playlist) => void;
  onCreateNew: () => void;
}
