
import { Playlist } from "@/components/playlist/types";

/**
 * Loads playlists from local storage
 */
export function loadPlaylists(): Playlist[] {
  const storedPlaylists = localStorage.getItem('musicPlaylists');
  if (storedPlaylists) {
    try {
      return JSON.parse(storedPlaylists);
    } catch (error) {
      console.error("Error parsing playlists:", error);
      return [];
    }
  }
  return [];
}

/**
 * Saves playlists to local storage
 */
export function savePlaylists(playlists: Playlist[]): void {
  localStorage.setItem('musicPlaylists', JSON.stringify(playlists));
}
