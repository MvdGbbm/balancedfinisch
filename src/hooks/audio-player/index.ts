
import { useRef } from 'react';
import { useAudioControls } from "./use-audio-controls";
import { useAudioErrorHandler } from "./use-audio-error-handler";
import { useAudioEvents } from "./use-audio-events";
import { useAudioLooping } from "./use-audio-looping";
import { useAudioLoader } from "./use-audio-loader";
import { useAudioVolume } from "./use-audio-volume";
import { useExternalPlayback } from "./use-external-playback";
import { AudioPlayerProps } from "./types";

export function useAudioPlayer({
  audioUrl,
  onEnded,
  onError,
  isPlayingExternal,
  onPlayPauseChange,
  nextAudioUrl,
  onCrossfadeStart,
  volume: initialVolume
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(initialVolume || 0.8);
  const [isLooping, setIsLooping] = useState(false);
  const [isCrossfading, setIsCrossfading] = useState(false);
  
  // Set up error handler
  const { 
    loadError,
    isRetrying,
    resetErrorState,
    handleError,
    manualRetry
  } = useAudioErrorHandler({ onError });

  // Setup audio loader and stream detection
  const {
    isLoaded,
    isLiveStream,
    playDirectly,
    resetLoadState
  } = useAudioLoader({
    audioUrl,
    isPlayingExternal,
    onPlayPauseChange
  });

  // Set up audio controls
  const { 
    togglePlay,
    handleRetry,
    toggleLoop,
    handleProgressChange,
    handleVolumeChange,
    skipTime
  } = useAudioControls({ 
    audioRef,
    setIsPlaying,
    isLooping,
    setIsLooping,
    volume,
    setVolume,
    duration,
    currentTime,
    setCurrentTime,
    handleError,
    audioUrl
  });

  // Set up audio events
  useAudioEvents({
    audioRef,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setIsLoaded: (loaded) => resetLoadState(),
    onEnded,
    handleError
  });

  // Initialize audio
  useAudioInitialization({
    audioRef,
    audioUrl,
    isPlayingExternal,
    resetLoadState,
    resetErrorState,
    playDirectly,
    setCurrentTime
  });

  // Handle looping
  useAudioLooping({
    audioRef,
    isLooping,
    isLiveStream
  });

  // Handle volume
  useAudioVolume({
    audioRef,
    initialVolume,
    setVolume
  });

  // Handle external playback control
  useExternalPlayback({
    audioRef,
    isPlayingExternal,
    isPlaying,
    audioUrl,
    playDirectly,
    setIsPlaying
  });

  return {
    audioRef,
    nextAudioRef,
    isPlaying,
    duration,
    currentTime,
    volume,
    isLooping,
    isLoaded,
    loadError,
    isRetrying,
    isCrossfading,
    isLiveStream,
    togglePlay,
    handleRetry,
    toggleLoop,
    handleProgressChange,
    handleVolumeChange,
    skipTime
  };
}

// Needed imports
import { useState } from 'react';
import { useAudioInitialization } from './use-audio-initialization';

export * from "./types";
