
import { useState, useRef } from "react";
import { useAudioErrorHandler } from "./use-audio-error-handler";
import { useAudioLoader } from "./use-audio-loader";
import { useAudioEvents } from "./use-audio-events";
import { useAudioControls } from "./use-audio-controls";
import { useAudioInitialization } from "./use-audio-initialization";
import { useAudioLooping } from "./use-audio-looping";
import { useAudioVolume } from "./use-audio-volume";
import { useExternalPlayback } from "./use-external-playback";

interface UseAudioPlaybackProps {
  audioUrl: string;
  title?: string;
  volume?: number;
  isPlayingExternal?: boolean;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  onEnded?: () => void;
  onError?: () => void;
}

export function useAudioPlayback({
  audioUrl,
  title,
  volume: initialVolume,
  isPlayingExternal,
  onPlayPauseChange,
  onEnded,
  onError
}: UseAudioPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(initialVolume ?? 0.8);
  const [isLooping, setIsLooping] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Using refactored hooks
  const {
    loadError,
    isRetrying,
    resetErrorState,
    handleError,
    manualRetry
  } = useAudioErrorHandler({ onError });
  
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
  
  const { togglePlay } = useAudioEvents({
    audioRef,
    isLoaded,
    isPlaying,
    isLiveStream,
    volume,
    isLooping,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setIsLoaded,
    setIsLiveStream: () => {}, // This is handled in useAudioLoader
    handleError,
    onEnded,
    onPlayPauseChange,
    audioUrl,
    title
  });
  
  const {
    handleRetry,
    toggleLoop,
    handleProgressChange,
    handleVolumeChange,
    skipTime
  } = useAudioControls({
    audioRef,
    isLiveStream,
    duration,
    volume,
    setVolume,
    setCurrentTime,
    isLooping,
    setIsLooping,
    playDirectly,
    audioUrl,
    manualRetry
  });
  
  // Handle audio initialization
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
  
  // Handle volume initialization
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
    isPlaying,
    duration,
    currentTime,
    volume,
    isLooping,
    isLoaded,
    loadError,
    isRetrying,
    isLiveStream,
    togglePlay,
    handleRetry,
    toggleLoop,
    handleProgressChange,
    handleVolumeChange,
    skipTime,
    playDirectly
  };
}
