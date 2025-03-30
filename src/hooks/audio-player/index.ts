
import { useState, useEffect } from "react";
import { validateAudioUrl, isStreamUrl } from "@/components/audio-player/utils";
import { useAudioState } from "./use-audio-state";
import { useAudioLoader } from "./use-audio-loader";
import { useAudioControls } from "./use-audio-controls";
import { useCrossfade } from "./use-crossfade";
import { useAudioEvents } from "./use-audio-events";
import { useUrlChange } from "./use-url-change";
import { useFormatSupport } from "./use-format-support";

interface UseAudioPlayerProps {
  audioUrl: string;
  onEnded?: () => void;
  onError?: () => void;
  isPlayingExternal?: boolean;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  nextAudioUrl?: string;
  onCrossfadeStart?: () => void;
  title?: string;
  volume?: number;
}

export const useAudioPlayer = ({
  audioUrl,
  onEnded,
  onError,
  isPlayingExternal,
  onPlayPauseChange,
  nextAudioUrl,
  onCrossfadeStart,
  title,
  volume: initialVolume
}: UseAudioPlayerProps) => {
  // Initialize all state and refs from useAudioState
  const {
    isPlaying, setIsPlaying,
    duration, setDuration,
    currentTime, setCurrentTime,
    volume, setVolume,
    isLooping, setIsLooping,
    isLoaded, setIsLoaded,
    loadError, setLoadError,
    isRetrying, setIsRetrying,
    isCrossfading, setIsCrossfading,
    isLiveStream, setIsLiveStream,
    audioRef,
    nextAudioRef,
    crossfadeTimeoutRef,
    retryCountRef
  } = useAudioState({ initialVolume });

  // Initialize format support utilities
  const { checkIfLiveStream } = useFormatSupport();

  // Initialize audio loader utilities
  const { playDirectly, handleRetry } = useAudioLoader({
    audioUrl,
    audioRef,
    setIsLoaded,
    setLoadError,
    setDuration,
    setCurrentTime,
    setIsLiveStream,
    retryCountRef,
    setIsRetrying,
    isPlaying,
    onError
  });

  // Initialize audio control functions
  const { togglePlay, toggleLoop, handleProgressChange, handleVolumeChange, skipTime } = useAudioControls({
    audioRef,
    nextAudioRef,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    isLooping,
    setIsLooping,
    isLoaded,
    duration,
    currentTime,
    setCurrentTime,
    isCrossfading,
    setIsCrossfading,
    crossfadeTimeoutRef,
    isLiveStream,
    playDirectly,
    audioUrl,
    title,
    onPlayPauseChange
  });

  // Initialize crossfade functionality
  useCrossfade({
    audioRef,
    nextAudioRef,
    isPlaying,
    isLoaded,
    duration,
    currentTime,
    volume,
    nextAudioUrl,
    isCrossfading,
    setIsCrossfading,
    crossfadeTimeoutRef,
    isLiveStream,
    onCrossfadeStart,
    onEnded
  });

  // Set up audio event listeners
  useAudioEvents({
    audioRef,
    audioUrl,
    volume,
    isLooping,
    setDuration,
    setCurrentTime,
    setIsLoaded,
    setLoadError,
    setIsLiveStream,
    setIsPlaying,
    retryCountRef,
    setIsRetrying,
    crossfadeTimeoutRef,
    playDirectly,
    isPlaying,
    onEnded,
    onError,
    title,
    onPlayPauseChange
  });

  // Handle URL changes
  useUrlChange({
    audioRef,
    audioUrl,
    setCurrentTime,
    setIsLoaded,
    setLoadError,
    setIsRetrying,
    setIsCrossfading,
    setIsLiveStream,
    retryCountRef,
    crossfadeTimeoutRef,
    isPlaying,
    playDirectly,
    checkIfLiveStream
  });

  // Handle external play/pause control
  useEffect(() => {
    if (isPlayingExternal !== undefined && audioRef.current) {
      console.log("External play control:", isPlayingExternal, "Current state:", isPlaying);
      if (isPlayingExternal && !isPlaying) {
        playDirectly(audioUrl, audioRef.current);
      } else if (!isPlayingExternal && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isPlayingExternal, audioUrl]);

  // Handle volume changes from props
  useEffect(() => {
    if (initialVolume !== undefined && audioRef.current) {
      audioRef.current.volume = initialVolume;
      setVolume(initialVolume);
    }
  }, [initialVolume]);

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
};
