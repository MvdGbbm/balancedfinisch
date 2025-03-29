
import { useAudioPlayback } from "./use-audio-playback";
import { useAudioCrossfade } from "./use-audio-crossfade";
import { AudioPlayerProps, AudioPlayerState, AudioPlayerControls } from "./types";

export function useAudioPlayer({
  audioUrl,
  onEnded,
  onError,
  isPlayingExternal,
  onPlayPauseChange,
  nextAudioUrl,
  onCrossfadeStart,
  title,
  volume: initialVolume
}: AudioPlayerProps) {
  const {
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
    skipTime
  } = useAudioPlayback({
    audioUrl,
    title,
    volume: initialVolume,
    isPlayingExternal,
    onPlayPauseChange,
    onEnded,
    onError
  });

  const {
    nextAudioRef,
    isCrossfading,
    resetCrossfade
  } = useAudioCrossfade({
    isPlaying,
    isLoaded,
    duration,
    currentTime,
    nextAudioUrl,
    volume,
    onEnded,
    onCrossfadeStart,
    isLiveStream
  });

  // Custom progress change handler that also handles crossfade reset
  const handleProgressChangeWithCrossfade = (newValue: number[]) => {
    handleProgressChange(newValue);
    
    // Reset crossfade if user seeks back before crossfade point
    if (isCrossfading && duration - newValue[0] > 5) {
      resetCrossfade();
    }
  };

  // Custom volume change handler that handles both audio elements
  const handleVolumeChangeWithCrossfade = (newValue: number[]) => {
    const newVolume = newValue[0];
    
    if (isCrossfading && nextAudioRef.current && audioRef.current) {
      const currentRatio = audioRef.current.volume / volume;
      const nextRatio = nextAudioRef.current.volume / volume;
      
      audioRef.current.volume = newVolume * currentRatio;
      nextAudioRef.current.volume = newVolume * nextRatio;
    }
    
    handleVolumeChange(newValue);
  };

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
    handleProgressChange: handleProgressChangeWithCrossfade,
    handleVolumeChange: handleVolumeChangeWithCrossfade,
    skipTime
  };
}

export * from "./types";
