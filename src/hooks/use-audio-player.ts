import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAudioPlayerCore } from "./audio/use-audio-player-core";
import { useAudioControls } from "./audio/use-audio-controls";
import { useAudioEvents } from "./audio/use-audio-events";
import { useAudioEffects } from "./audio/use-audio-effects";

/**
 * Custom hook that handles audio player functionality
 * This is now using the modular hooks for better maintainability
 */
export const useAudioPlayer = (options: {
  audioUrl: string;
  nextAudioUrl?: string;
  isPlayingExternal?: boolean;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  volume?: number;
  onError?: () => void;
  onEnded?: () => void;
  onCrossfadeStart?: () => void;
  title?: string;
}) => {
  // Use the core audio player hook
  const audioCore = useAudioPlayerCore({
    audioUrl: options.audioUrl,
    nextAudioUrl: options.nextAudioUrl,
    isPlayingExternal: options.isPlayingExternal,
    onPlayPauseChange: options.onPlayPauseChange,
    onEnded: options.onEnded,
    onCrossfadeStart: options.onCrossfadeStart,
    initialVolume: options.volume || 0.7,
    title: options.title,
  });

  // Use the audio controls hook
  const audioControls = useAudioControls(audioCore.setupAudioHandlers());

  // Use the audio events hook
  const audioEvents = useAudioEvents(audioCore.setupAudioEventHandlers());

  // Use the audio effects hook
  const audioEffects = useAudioEffects({
    audioRef: audioCore.audioRef,
    volume: audioCore.volume,
    isLooping: audioCore.isLooping,
    setVolume: audioCore.setVolume,
    setIsLooping: audioCore.setIsLooping,
  });

  useEffect(() => {
    if (options.volume !== undefined) {
      audioCore.setVolume(options.volume);
    }
  }, [options.volume, audioCore.setVolume]);

  return {
    ...audioCore,
    ...audioControls,
    ...audioEvents,
    ...audioEffects,
  };
};
