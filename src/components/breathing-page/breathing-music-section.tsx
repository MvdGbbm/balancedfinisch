
import React, { memo, useMemo } from "react";
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

export const BreathingMusicSection = memo(({
  musicTracks,
  currentTrack,
  isTrackPlaying,
  musicVolume,
  onPlayTrack,
  audioPlayerRef,
  onTrackPlayPauseChange
}: BreathingMusicSectionProps) => {
  // Use useMemo to prevent unnecessary filtering on each render
  const musicOnlyTracks = useMemo(() => 
    musicTracks.filter(track => track.category === "Muziek"),
    [musicTracks]
  );
  
  return (
    <BreathingMusicPlayer
      musicTracks={musicOnlyTracks}
      currentTrack={currentTrack}
      isTrackPlaying={isTrackPlaying}
      musicVolume={musicVolume}
      onPlayTrack={onPlayTrack}
      audioPlayerRef={audioPlayerRef}
      onTrackPlayPauseChange={onTrackPlayPauseChange}
    />
  );
});

// Add display name for debugging
BreathingMusicSection.displayName = "BreathingMusicSection";
