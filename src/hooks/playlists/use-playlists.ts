
import { useState, useEffect } from "react";
import { Playlist } from "@/components/playlist/types";
import { Soundscape } from "@/lib/types";
import { loadPlaylists, savePlaylists } from "./playlist-storage";
import { usePlaylistActions } from "./playlist-actions";
import { findTrackById, getPlaylistTracks as getPlaylistTracksUtil } from "./playlist-utils";
import { PlaylistHookReturn } from "./types";

export function usePlaylists(soundscapes: Soundscape[]): PlaylistHookReturn {
  // State
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [nextTrack, setNextTrack] = useState<Soundscape | null>(null);
  const [showPlaylistCreator, setShowPlaylistCreator] = useState(false);
  const [isCrossfading, setIsCrossfading] = useState(false);

  // Load playlists from local storage
  useEffect(() => {
    const loadedPlaylists = loadPlaylists();
    setPlaylists(loadedPlaylists);
  }, []);

  // Save playlists to local storage when they change
  useEffect(() => {
    savePlaylists(playlists);
  }, [playlists]);

  // Set next track when current track changes
  useEffect(() => {
    if (selectedPlaylist && selectedPlaylist.tracks.length > 0) {
      const nextIndex = (currentTrackIndex + 1) % selectedPlaylist.tracks.length;
      const nextTrackId = selectedPlaylist.tracks[nextIndex].trackId;
      const nextTrackObj = findTrackById(soundscapes, nextTrackId);
      setNextTrack(nextTrackObj);
    } else {
      setNextTrack(null);
    }
  }, [currentTrackIndex, selectedPlaylist, soundscapes]);

  // Playlist actions
  const actions = usePlaylistActions(
    soundscapes,
    playlists,
    setPlaylists,
    selectedPlaylist,
    setSelectedPlaylist,
    currentTrackIndex,
    setCurrentTrackIndex,
    setShowPlaylistCreator,
    setIsCrossfading
  );

  // Utility function for getting tracks from a playlist
  const getPlaylistTracks = (playlist: Playlist): Soundscape[] => {
    return getPlaylistTracksUtil(playlist, soundscapes);
  };

  return {
    // State
    playlists,
    selectedPlaylist,
    currentTrackIndex,
    nextTrack,
    showPlaylistCreator,
    isCrossfading,
    
    // Actions
    setShowPlaylistCreator,
    handlePlayPlaylist: actions.handlePlayPlaylist,
    handleStopPlaylist: actions.handleStopPlaylist,
    handleAddToPlaylist: actions.handleAddToPlaylist,
    handleRemoveFromPlaylist: actions.handleRemoveFromPlaylist,
    handleCreatePlaylist: actions.handleCreatePlaylist,
    handleTrackEnded: actions.handleTrackEnded,
    handleCrossfadeStart: actions.handleCrossfadeStart,
    getPlaylistTracks
  };
}
