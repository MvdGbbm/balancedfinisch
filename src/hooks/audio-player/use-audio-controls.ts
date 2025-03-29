
import { useCallback } from "react";

interface UseAudioControlsProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isLiveStream: boolean;
  duration: number;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  isLooping: boolean;
  setIsLooping: React.Dispatch<React.SetStateAction<boolean>>;
  playDirectly: (url: string, audioElement: HTMLAudioElement | null) => boolean;
  audioUrl: string;
  manualRetry: () => boolean;
}

export function useAudioControls({
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
}: UseAudioControlsProps) {
  const handleRetry = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    console.log("Manual retry requested for:", audioUrl);
    
    if (manualRetry()) {
      setTimeout(() => {
        playDirectly(audioUrl, audio);
      }, 100);
    }
  }, [audioRef, audioUrl, playDirectly, manualRetry]);

  const toggleLoop = useCallback(() => {
    setIsLooping(prevIsLooping => !prevIsLooping);
  }, [setIsLooping]);

  const handleProgressChange = useCallback((newValue: number[]) => {
    const audio = audioRef.current;
    if (!audio || isLiveStream) return;
    
    const newTime = newValue[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [audioRef, isLiveStream, setCurrentTime]);

  const handleVolumeChange = useCallback((newValue: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = newValue[0];
    audio.volume = newVolume;
    setVolume(newVolume);
  }, [audioRef, setVolume]);

  const skipTime = useCallback((amount: number) => {
    const audio = audioRef.current;
    if (!audio || isLiveStream) return;
    
    audio.currentTime = Math.min(Math.max(audio.currentTime + amount, 0), duration);
  }, [audioRef, isLiveStream, duration]);

  return {
    handleRetry,
    toggleLoop,
    handleProgressChange,
    handleVolumeChange,
    skipTime
  };
}
