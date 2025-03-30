
import { Playlist } from "@/components/playlist/types";
import { Soundscape } from "@/lib/types";

export interface PlaylistState {
  playlists: Playlist[];
  selectedPlaylist: Playlist | null;
  currentTrackIndex: number;
  nextTrack: Soundscape | null;
  showPlaylistCreator: boolean;
  isCrossfading: boolean;
}

export interface PlaylistActions {
  setShowPlaylistCreator: (show: boolean) => void;
  handlePlayPlaylist: (
    playlist: Playlist, 
    onStreamStop: () => void, 
    setCurrentTrack: (track: Soundscape | null) => void, 
    setIsPlaying: (isPlaying: boolean) => void
  ) => void;
  handleStopPlaylist: (
    setCurrentTrack: (track: Soundscape | null) => void, 
    setIsPlaying: (isPlaying: boolean) => void
  ) => void;
  handleAddToPlaylist: (track: Soundscape, playlistId: string) => void;
  handleRemoveFromPlaylist: (
    trackId: string, 
    playlistId: string, 
    setCurrentTrack: (track: Soundscape | null) => void,
    setIsPlaying: (isPlaying: boolean) => void
  ) => void;
  handleCreatePlaylist: (name: string) => void;
  handleTrackEnded: () => void;
  handleCrossfadeStart: () => void;
  getPlaylistTracks: (playlist: Playlist) => Soundscape[];
}

export type PlaylistHookReturn = PlaylistState & PlaylistActions;
