
import React from "react";
import { BreathingMusicPlayer } from "@/components/breathing-page/music-player";
import { Soundscape } from "@/lib/types";

interface BreathingMusicSectionProps {
  musicTracks: Soundscape[];
  currentTrack: Soundscape | null;
  isTrackPlaying: boolean;
  musicVolume: number;
  onPlayTrack: (track: Soundscape) => void;
  audioPlayerRef: React.RefObject<HTMLAudioElement>;
  onTrackPlayPauseChange: (isPlaying: boolean) => void;
}

export const BreathingMusicSection: React.FC<BreathingMusicSectionProps> = ({
  musicTracks,
  currentTrack,
  isTrackPlaying,
  musicVolume,
  onPlayTrack,
  audioPlayerRef,
  onTrackPlayPauseChange
}) => {
  return (
    <BreathingMusicPlayer
      musicTracks={musicTracks}
      currentTrack={currentTrack}
      isTrackPlaying={isTrackPlaying}
      musicVolume={musicVolume}
      onPlayTrack={onPlayTrack}
      audioPlayerRef={audioPlayerRef}
      onTrackPlayPauseChange={onTrackPlayPauseChange}
    />
  );
};
