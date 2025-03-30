
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AudioPlayerState, AudioPlayerHookReturn, UseAudioPlayerProps, CROSSFADE_DURATION } from "./types";
import { useAudioControls } from "./use-audio-controls";
import { useAudioEffects } from "./use-audio-effects";
import { useAudioEvents } from "./use-audio-events";
import { playDirectly } from "./utils";

export const useAudioPlayerCore = ({
  audioUrl,
  onEnded,
  onError,
  isPlayingExternal,
  onPlayPauseChange,
  nextAudioUrl,
  onCrossfadeStart,
  title,
  volume: initialVolume
}: UseAudioPlayerProps): AudioPlayerHookReturn => {
  // Core state
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(initialVolume ?? 0.8);
  const [isLooping, setIsLooping] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const [isLiveStream, setIsLiveStream] = useState(false);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const crossfadeTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  
  const { toast } = useToast();
  
  const state: AudioPlayerState = {
    isPlaying,
    duration,
    currentTime,
    volume,
    isLooping,
    isLoaded,
    loadError,
    isRetrying,
    isCrossfading,
    isLiveStream
  };
  
  // Controls
  const controls = useAudioControls({
    state,
    audioRef,
    nextAudioRef,
    audioUrl,
    toast,
    setIsPlaying,
    setVolume,
    setIsLooping,
    setLoadError,
    setIsRetrying,
    retryCountRef,
    onPlayPauseChange,
    title,
    isCrossfading
  });
  
  // Effects for crossfading, volume changes, etc.
  useAudioEffects({
    state,
    audioRef,
    nextAudioRef,
    audioUrl,
    nextAudioUrl,
    crossfadeTimeoutRef,
    onCrossfadeStart,
    onEnded,
    setIsCrossfading,
    setCurrentTime,
    volume
  });
  
  // Events (audio element event handlers)
  useAudioEvents({
    state,
    audioRef,
    setDuration,
    setCurrentTime,
    setIsLoaded,
    setLoadError,
    setIsPlaying,
    setIsLiveStream,
    retryCountRef,
    setIsRetrying,
    toast,
    onEnded,
    onError,
    onPlayPauseChange,
    audioUrl,
    isPlayingExternal,
    crossfadeTimeoutRef,
    isCrossfading
  });
  
  // Handle external play/pause
  useEffect(() => {
    if (isPlayingExternal !== undefined && audioRef.current) {
      console.log("External play control:", isPlayingExternal, "Current state:", isPlaying);
      if (isPlayingExternal && !isPlaying) {
        playDirectly(audioUrl, audioRef.current, retryCountRef, setLoadError, onError, setIsPlaying, onPlayPauseChange);
      } else if (!isPlayingExternal && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isPlayingExternal, audioUrl, isPlaying, onPlayPauseChange, onError]);
  
  // Initial volume setting
  useEffect(() => {
    if (initialVolume !== undefined && audioRef.current) {
      audioRef.current.volume = initialVolume;
      setVolume(initialVolume);
    }
  }, [initialVolume]);
  
  return {
    ...state,
    ...controls,
    audioRef,
    nextAudioRef
  };
};
