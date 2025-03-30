
import { Playlist } from "@/components/playlist/types";
import { Soundscape } from "@/lib/types";

/**
 * Finds a track in the soundscapes array by its ID
 */
export function findTrackById(soundscapes: Soundscape[], trackId: string): Soundscape | null {
  return soundscapes.find(s => s.id === trackId) || null;
}

/**
 * Gets the next track index in a playlist
 */
export function getNextTrackIndex(currentIndex: number, playlistLength: number): number {
  if (playlistLength === 0) return 0;
  return (currentIndex + 1) % playlistLength;
}

/**
 * Converts playlist track IDs to actual Soundscape objects
 */
export function getPlaylistTracks(playlist: Playlist, soundscapes: Soundscape[]): Soundscape[] {
  return playlist.tracks
    .map(track => soundscapes.find(s => s.id === track.trackId))
    .filter((track): track is Soundscape => track !== undefined);
}

/**
 * Checks if a track exists in a playlist
 */
export function isTrackInPlaylist(playlist: Playlist, trackId: string): boolean {
  return playlist.tracks.some(t => t.trackId === trackId);
}

/**
 * Creates a new playlist object
 */
export function createNewPlaylist(name: string): Playlist {
  return {
    id: `playlist-${Date.now()}`,
    name,
    tracks: [],
    createdAt: new Date().toISOString()
  };
}
