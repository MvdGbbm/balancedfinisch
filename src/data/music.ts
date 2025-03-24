
import { Track, Playlist } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// Sample tracks for meditation music
export const tracks: Track[] = [
  {
    id: "track-1",
    title: "Morning Meditation",
    artist: "Balanced Mind",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_1424b383e7.mp3",
    coverImageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=500&q=60",
    duration: 180,
    genre: "Ambient",
    tags: ["meditation", "morning", "calm"]
  },
  {
    id: "track-2",
    title: "Deep Relaxation",
    artist: "Mindful Sounds",
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/11/25/audio_cb1c56b0d9.mp3",
    coverImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=500&q=60",
    duration: 240,
    genre: "Ambient",
    tags: ["relaxation", "deep", "sleep"]
  },
  {
    id: "track-3",
    title: "Ocean Waves",
    artist: "Nature Sounds",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/13/audio_b5e65ee3c4.mp3",
    coverImageUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=500&q=60",
    duration: 320,
    genre: "Nature",
    tags: ["ocean", "waves", "nature"]
  },
  {
    id: "track-4",
    title: "Forest Sounds",
    artist: "Nature Sounds",
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/08/audio_017d8cfdc5.mp3",
    coverImageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=500&q=60",
    duration: 280,
    genre: "Nature",
    tags: ["forest", "birds", "nature"]
  },
  {
    id: "track-5",
    title: "Chakra Healing",
    artist: "Healing Vibrations",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/09/audio_0252edaf09.mp3",
    coverImageUrl: "https://images.unsplash.com/photo-1566221857770-326f68e571b7?auto=format&fit=crop&w=500&q=60",
    duration: 360,
    genre: "Meditation",
    tags: ["chakra", "healing", "energy"]
  },
  {
    id: "track-6",
    title: "Zen Garden",
    artist: "Mindful Sounds",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/19/audio_c8a8d7c9a6.mp3",
    coverImageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=60",
    duration: 240,
    genre: "Zen",
    tags: ["zen", "garden", "peace"]
  },
  {
    id: "track-7",
    title: "Crystal Bowls",
    artist: "Sound Healing",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_1e2e2c4243.mp3",
    coverImageUrl: "https://images.unsplash.com/photo-1515266591878-f93e32bc5937?auto=format&fit=crop&w=500&q=60",
    duration: 300,
    genre: "Meditation",
    tags: ["crystal", "bowls", "healing"]
  },
  {
    id: "track-8",
    title: "Peaceful Piano",
    artist: "Piano Meditations",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/20/audio_85ff18dc9a.mp3",
    coverImageUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=500&q=60",
    duration: 240,
    genre: "Piano",
    tags: ["piano", "peaceful", "calm"]
  },
  {
    id: "track-9",
    title: "Night Sky",
    artist: "Ambient Sounds",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_88937086af.mp3",
    coverImageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=500&q=60",
    duration: 280,
    genre: "Ambient",
    tags: ["night", "sky", "stars"]
  },
  {
    id: "track-10",
    title: "Rainforest",
    artist: "Nature Sounds",
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/09/audio_88447e927c.mp3",
    coverImageUrl: "https://images.unsplash.com/photo-1501671952491-e5ca507e6e64?auto=format&fit=crop&w=500&q=60",
    duration: 320,
    genre: "Nature",
    tags: ["rain", "forest", "nature"]
  }
];

export const playlists: Playlist[] = [
  {
    id: "playlist-1",
    name: "Morning Meditation",
    description: "Start your day with these calming tracks",
    coverImageUrl: "https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?auto=format&fit=crop&w=500&q=60",
    tracks: ["track-1", "track-5", "track-8"],
    trackCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "playlist-2",
    name: "Nature Sounds",
    description: "Connect with nature through these peaceful sounds",
    coverImageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=500&q=60",
    tracks: ["track-3", "track-4", "track-10"],
    trackCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "playlist-3",
    name: "Deep Relaxation",
    description: "Perfect for evening relaxation and sleep",
    coverImageUrl: "https://images.unsplash.com/photo-1455642305367-68834a9d7fb2?auto=format&fit=crop&w=500&q=60",
    tracks: ["track-2", "track-6", "track-9"],
    trackCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "playlist-4",
    name: "Sound Healing",
    description: "Heal your mind and body with these vibrations",
    coverImageUrl: "https://images.unsplash.com/photo-1519638399535-1b036603ac77?auto=format&fit=crop&w=500&q=60",
    tracks: ["track-5", "track-7", "track-1"],
    trackCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Helper function to create a new track
export function createTrack(trackData: Partial<Track>): Track {
  return {
    id: uuidv4(),
    title: trackData.title || "New Track",
    artist: trackData.artist || "Unknown Artist",
    audioUrl: trackData.audioUrl || "",
    coverImageUrl: trackData.coverImageUrl,
    duration: trackData.duration || 0,
    album: trackData.album,
    year: trackData.year,
    genre: trackData.genre,
    tags: trackData.tags || [],
  };
}

// Helper function to create a new playlist
export function createPlaylist(playlistData: Partial<Playlist>): Playlist {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name: playlistData.name || "New Playlist",
    description: playlistData.description,
    coverImageUrl: playlistData.coverImageUrl,
    tracks: playlistData.tracks || [],
    trackCount: playlistData.tracks?.length || 0,
    createdAt: now,
    updatedAt: now,
  };
}

// Helper function to get a track by ID
export function getTrackById(id: string): Track | undefined {
  return tracks.find(track => track.id === id);
}

// Helper function to get tracks for a playlist
export function getTracksForPlaylist(playlistId: string): Track[] {
  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) return [];
  
  return playlist.tracks
    .map(trackId => getTrackById(trackId))
    .filter((track): track is Track => track !== undefined);
}
