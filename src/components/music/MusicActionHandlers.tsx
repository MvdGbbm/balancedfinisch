
import React from "react";
import { Soundscape } from "@/lib/types";
import { Playlist } from "@/components/playlist/types";
import { RadioStream } from "@/hooks/use-radio-streams";

interface MusicActionHandlersProps {
  handlePlayPlaylist: (
    playlist: Playlist, 
    handleStreamStop: () => void, 
    setCurrentTrack: (track: Soundscape | null) => void, 
    setIsPlaying: (isPlaying: boolean) => void
  ) => void;
  handleStopPlaylist: (
    setCurrentTrack: (track: Soundscape | null) => void, 
    setIsPlaying: (isPlaying: boolean) => void
  ) => void;
  handleRemoveFromPlaylist: (
    trackId: string, 
    playlistId: string, 
    setCurrentTrack: (track: Soundscape | null) => void, 
    setIsPlaying: (isPlaying: boolean) => void
  ) => void;
  setCurrentTrack: (track: Soundscape | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  handleStreamStop: () => void;
  children: (handlers: {
    handlePlaylistPlay: (playlist: Playlist) => void;
    handlePlaylistStop: () => void;
    handleTrackRemove: (trackId: string, playlistId: string) => void;
  }) => React.ReactNode;
}

export const MusicActionHandlers: React.FC<MusicActionHandlersProps> = ({
  handlePlayPlaylist,
  handleStopPlaylist,
  handleRemoveFromPlaylist,
  setCurrentTrack,
  setIsPlaying,
  handleStreamStop,
  children
}) => {
  // Simplified handlers with proper parameter passing
  const handlePlaylistPlay = (playlist: Playlist) => {
    handlePlayPlaylist(
      playlist, 
      handleStreamStop, 
      setCurrentTrack, 
      setIsPlaying
    );
  };

  const handlePlaylistStop = () => {
    handleStopPlaylist(setCurrentTrack, setIsPlaying);
  };

  const handleTrackRemove = (trackId: string, playlistId: string) => {
    handleRemoveFromPlaylist(
      trackId, 
      playlistId, 
      setCurrentTrack, 
      setIsPlaying
    );
  };

  return <>{children({
    handlePlaylistPlay,
    handlePlaylistStop,
    handleTrackRemove
  })}</>;
};
