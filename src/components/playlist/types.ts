
export interface PlaylistTrack {
  trackId: string;
  added: string; // ISO 8601 date string
}

export interface Playlist {
  id: string;
  name: string;
  tracks: PlaylistTrack[];
  createdAt: string; // ISO 8601 date string
}
