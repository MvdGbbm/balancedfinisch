
import { useState, useRef, useEffect } from "react";
import { useAudioValidation } from "./use-audio-validation";
import { useAudioErrorHandler } from "./use-audio-error-handler";
import { useAudioLoader } from "./use-audio-loader";
import { useAudioEvents } from "./use-audio-events";
import { useAudioControls } from "./use-audio-controls";

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
    setDuration,
    setIsLoaded,
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
    setIsLiveStream,
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

  // Handle external play control changes
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
  }, [isPlayingExternal, audioUrl, isPlaying, playDirectly]);

  // Handle audio URL changes
  useEffect(() => {
    console.log("Audio URL changed to:", audioUrl);
    
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.pause();
    
    setCurrentTime(0);
    resetLoadState();
    resetErrorState();
    
    if (!audioUrl) {
      console.log("Empty audio URL, not attempting to play");
      return;
    }
    
    if (isPlayingExternal) {
      console.log("External play requested for new URL:", audioUrl);
      setTimeout(() => {
        playDirectly(audioUrl, audio);
      }, 100);
    } else {
      console.log("Loading new URL without autoplay:", audioUrl);
      const { validateAudioUrl } = useAudioValidation();
      const validatedUrl = validateAudioUrl(audioUrl);
      if (validatedUrl) {
        audio.src = validatedUrl;
        audio.load();
      }
    }
  }, [audioUrl, isPlayingExternal, resetLoadState, resetErrorState, playDirectly]);

  // Handle loop mode changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isLiveStream) return;
    
    audio.loop = isLooping;
    
    if (isLooping) {
      const handleSeamlessLoop = () => {
        if (audio.duration > 0 && audio.currentTime >= audio.duration - 0.2) {
          const currentVolume = audio.volume;
          const currentPlaybackRate = audio.playbackRate;
          
          audio.currentTime = 0;
          audio.playbackRate = currentPlaybackRate;
          audio.volume = currentVolume;
        }
      };
      
      const intervalId = setInterval(handleSeamlessLoop, 10);
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isLooping, isLiveStream]);

  // Handle initial volume setting
  useEffect(() => {
    if (initialVolume !== undefined && audioRef.current) {
      audioRef.current.volume = initialVolume;
      setVolume(initialVolume);
    }
  }, [initialVolume]);

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
