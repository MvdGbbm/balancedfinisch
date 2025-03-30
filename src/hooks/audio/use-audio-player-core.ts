
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { isStreamUrl, formatTime } from "@/components/audio-player/utils";
import { AudioPlayerState } from "./types";

/**
 * Core audio player hook that handles the main audio functionality
 */
export const useAudioPlayerCore = ({
  audioUrl,
  nextAudioUrl,
  isPlayingExternal,
  onPlayPauseChange,
  onEnded,
  onCrossfadeStart,
  initialVolume = 0.7,
  title,
}: {
  audioUrl: string;
  nextAudioUrl?: string;
  isPlayingExternal?: boolean;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  onEnded?: () => void;
  onCrossfadeStart?: () => void;
  initialVolume?: number;
  title?: string;
}) => {
  // State
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    volume: initialVolume,
    currentTime: 0,
    duration: 0,
    isLoaded: false,
    isLiveStream: false,
    loadError: false,
    isRetrying: false,
    isLooping: false,
    isCrossfading: false,
  });

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const retryCountRef = useRef(0);
  const lastUrlRef = useRef<string | null>(null);

  // Set up handlers for the audio element
  const setupAudioHandlers = () => {
    if (!audioRef.current) return;

    return {
      state,
      audioRef,
      nextAudioRef,
      audioUrl,
      setIsPlaying: (isPlaying: boolean) => setState(prev => ({ ...prev, isPlaying })),
      setVolume: (volume: number) => setState(prev => ({ ...prev, volume })),
      setIsLooping: (isLooping: boolean) => setState(prev => ({ ...prev, isLooping })),
      setLoadError: (loadError: boolean) => setState(prev => ({ ...prev, loadError })),
      setIsRetrying: (isRetrying: boolean) => setState(prev => ({ ...prev, isRetrying })),
      retryCountRef,
      onPlayPauseChange,
      title,
      isCrossfading: state.isCrossfading,
    };
  };

  // Set up event handlers for the audio element
  const setupAudioEventHandlers = () => {
    if (!audioRef.current) return;

    return {
      state,
      audioRef,
      setDuration: (duration: number) => setState(prev => ({ ...prev, duration })),
      setCurrentTime: (currentTime: number) => setState(prev => ({ ...prev, currentTime })),
      setIsLoaded: (isLoaded: boolean) => setState(prev => ({ ...prev, isLoaded })),
      setLoadError: (loadError: boolean) => setState(prev => ({ ...prev, loadError })),
      setIsPlaying: (isPlaying: boolean) => setState(prev => ({ ...prev, isPlaying })),
      setIsLiveStream: (isLiveStream: boolean) => setState(prev => ({ ...prev, isLiveStream })),
      retryCountRef,
      setIsRetrying: (isRetrying: boolean) => setState(prev => ({ ...prev, isRetrying })),
      onEnded,
      onCrossfadeStart,
      nextAudioRef,
      nextAudioUrl,
      setIsCrossfading: (isCrossfading: boolean) => setState(prev => ({ ...prev, isCrossfading })),
      isCrossfading: state.isCrossfading,
      onPlayPauseChange,
      audioUrl,
      isPlayingExternal,
    };
  };
  
  // Initialize the audio element and set up event listeners
  useEffect(() => {
    if (!audioUrl) return;

    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.volume = state.volume;
      audioRef.current.preload = "metadata";
    }

    const audio = audioRef.current;
    const isStream = isStreamUrl(audioUrl);

    // Update isLiveStream state
    setState(prev => ({ ...prev, isLiveStream: isStream }));

    // Load metadata and set duration
    const handleMetadataLoaded = () => {
      if (audio) {
        setState(prev => ({
          ...prev,
          duration: audio.duration,
        }));
      }
    };

    // Handle audio load error
    const handleLoadError = () => {
      console.error("Error loading audio:", audioUrl);
      setState(prev => ({ ...prev, loadError: true }));
      toast({
        title: "Fout bij laden",
        description: "Audio kon niet worden geladen. Controleer de URL.",
        variant: "destructive",
      });
    };

    // Set initial volume
    audio.volume = state.volume;

    // Add event listeners
    audio.addEventListener("loadedmetadata", handleMetadataLoaded);
    audio.addEventListener("error", handleLoadError);

    // Clean up event listeners on unmount
    return () => {
      audio.removeEventListener("loadedmetadata", handleMetadataLoaded);
      audio.removeEventListener("error", handleLoadError);
    };
  }, [audioUrl, state.volume]);

  // Handle external isPlaying changes
  useEffect(() => {
    if (isPlayingExternal !== undefined && state.isPlaying !== isPlayingExternal) {
      if (isPlayingExternal) {
        audioRef.current?.play()
          .then(() => setState(prev => ({ ...prev, isPlaying: true })))
          .catch(error => {
            console.error("Error playing audio:", error);
            setState(prev => ({ ...prev, loadError: true }));
            toast({
              title: "Fout bij afspelen",
              description: "Audio kon niet worden afgespeeld.",
              variant: "destructive",
            });
          });
      } else {
        audioRef.current?.pause();
        setState(prev => ({ ...prev, isPlaying: false }));
      }

      if (onPlayPauseChange) {
        onPlayPauseChange(isPlayingExternal);
      }
    }
  }, [isPlayingExternal, onPlayPauseChange, state.isPlaying]);
  
  return {
    // Expose the state and methods
    ...state,
    audioRef,
    nextAudioRef,
    setState,
    togglePlay: () => { /* Will be implemented in use-audio-controls */ },
    handleVolumeChange: () => { /* Will be implemented in use-audio-controls */ },
    handleTimeUpdate: () => { /* Will be implemented in use-audio-controls */ },
    handleRetry: () => { /* Will be implemented in use-audio-controls */ },
    formatTime,
    setupAudioHandlers,
    setupAudioEventHandlers,
    lastUrlRef,
  };
};
