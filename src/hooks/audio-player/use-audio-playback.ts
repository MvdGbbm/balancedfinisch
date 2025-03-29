
import { useEffect, useState } from "react";
import { useAudioValidation } from "./use-audio-validation";
import { useAudioErrorHandler } from "./use-audio-error-handler";
import { useAudioEvents } from "./use-audio-events";
import { useAudioControls } from "./use-audio-controls";
import { useAudioInitialization } from "./use-audio-initialization";
import { useAudioLooping } from "./use-audio-looping";
import { useAudioVolume } from "./use-audio-volume";
import { useExternalPlayback } from "./use-external-playback";

interface UseAudioPlaybackProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  audioUrl: string;
  isPlayingExternal?: boolean;
  isLooping?: boolean;
  initialVolume?: number;
  isLiveStream?: boolean;
}

export function useAudioPlayback({
  audioRef,
  audioUrl,
  isPlayingExternal = false,
  isLooping = false,
  initialVolume = 0.8,
  isLiveStream = false
}: UseAudioPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(initialVolume);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Reset loading state
  const resetLoadState = () => {
    setIsLoaded(false);
    setIsBuffering(false);
  };

  // Set up error handler
  const { errorMessage, hasError, resetErrorState, handleError } = useAudioErrorHandler();

  // Set up audio controls 
  const { playAudio, pauseAudio, togglePlayPause, seekTo, handleVolumeChange, setPlaybackSpeed, playDirectly } = 
    useAudioControls({ audioRef, setIsPlaying, setHasUserInteracted, handleError });

  // Set up audio events
  useAudioEvents({
    audioRef,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setIsLoaded,
    setIsBuffering,
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
    // State
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoaded,
    isBuffering,
    playbackRate,
    hasError,
    errorMessage,
    hasUserInteracted,
    
    // Controls
    playAudio,
    pauseAudio,
    togglePlayPause,
    seekTo,
    handleVolumeChange,
    setPlaybackSpeed,
    resetErrorState,
    
    // Advanced playback
    playDirectly
  };
}
