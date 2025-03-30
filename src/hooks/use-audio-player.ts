
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAudioPlayerCore } from "./hooks/audio/use-audio-player-core";
import { useAudioControls } from "./hooks/audio/use-audio-controls";
import { useAudioEvents } from "./hooks/audio/use-audio-events";
import { useAudioEffects } from "./hooks/audio/use-audio-effects";

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

  const crossfadeTimeoutRef = useRef(null);

  // Use the audio controls hook
  const audioControls = useAudioControls(audioCore.setupAudioHandlers());

  // Use the audio events hook
  const audioEvents = useAudioEvents(audioCore.setupAudioEventHandlers());

  // Use the audio effects hook
  const audioEffects = useAudioEffects({
    audioRef: audioCore.audioRef,
    nextAudioRef: audioCore.nextAudioRef,
    audioUrl: options.audioUrl,
    nextAudioUrl: options.nextAudioUrl,
    volume: audioCore.volume,
    isLooping: audioCore.isLooping,
    state: audioCore,
    setVolume: (volume) => audioCore.setState(prev => ({ ...prev, volume })),
    setIsLooping: (isLooping) => audioCore.setState(prev => ({ ...prev, isLooping })),
    crossfadeTimeoutRef,
    onCrossfadeStart: options.onCrossfadeStart,
    onEnded: options.onEnded,
    setIsCrossfading: (isCrossfading) => audioCore.setState(prev => ({ ...prev, isCrossfading })),
    setCurrentTime: (currentTime) => audioCore.setState(prev => ({ ...prev, currentTime })),
  });

  useEffect(() => {
    if (options.volume !== undefined) {
      audioCore.setState(prev => ({ ...prev, volume: options.volume }));
    }
  }, [options.volume]);

  return {
    ...audioCore,
    ...audioControls,
    ...audioEvents,
  };
};
