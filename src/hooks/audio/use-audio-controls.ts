
import { RefObject, MutableRefObject } from "react";
import { Toast } from "@/hooks/use-toast";
import { AudioPlayerState, AudioPlayerControls, MAX_RETRY_COUNT } from "./types";
import { playDirectly } from "./utils";

interface UseAudioControlsProps {
  state: AudioPlayerState;
  audioRef: RefObject<HTMLAudioElement>;
  nextAudioRef: RefObject<HTMLAudioElement>;
  audioUrl: string;
  toast: Toast;
  setIsPlaying: (value: boolean) => void;
  setVolume: (value: number) => void;
  setIsLooping: (value: boolean) => void;
  setLoadError: (value: boolean) => void;
  setIsRetrying: (value: boolean) => void;
  retryCountRef: MutableRefObject<number>;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  title?: string;
  isCrossfading: boolean;
}

export const useAudioControls = ({
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
}: UseAudioControlsProps): AudioPlayerControls => {
  const { isPlaying, volume, isLoaded, isLiveStream, duration } = state;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    console.log("Toggle play, current state:", isPlaying);
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (onPlayPauseChange) onPlayPauseChange(false);
      
      if (isCrossfading && nextAudioRef.current) {
        nextAudioRef.current.pause();
      }
      
      toast({
        title: "Gepauzeerd",
        description: "De audio is gepauzeerd."
      });
    } else {
      if (!isLoaded) {
        console.log("Not loaded yet, using direct play");
        playDirectly(audioUrl, audio, retryCountRef, setLoadError, undefined, setIsPlaying, onPlayPauseChange);
      } else {
        console.log("Already loaded, using regular play");
        audio.play()
          .then(() => {
            setIsPlaying(true);
            if (onPlayPauseChange) onPlayPauseChange(true);
            
            if (isCrossfading && nextAudioRef.current) {
              nextAudioRef.current.play().catch(error => {
                console.error("Error resuming next audio:", error);
              });
            }
            
            toast({
              title: "Speelt nu",
              description: title ? `"${title}" speelt nu` : "De audio speelt nu"
            });
          })
          .catch(error => {
            console.error("Error playing audio:", error);
            toast({
              variant: "destructive",
              title: "Fout bij afspelen",
              description: "Kon de audio niet afspelen. Probeer het later opnieuw."
            });
          });
      }
    }
  };

  const handleRetry = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    console.log("Manual retry requested for:", audioUrl);
    
    setLoadError(false);
    setIsRetrying(true);
    retryCountRef.current = 0;
    
    setTimeout(() => {
      playDirectly(audioUrl, audio, retryCountRef, setLoadError, undefined, setIsPlaying, onPlayPauseChange);
      
      toast({
        title: "Opnieuw laden",
        description: "Probeert audio opnieuw te laden."
      });
    }, 100);
  };

  const toggleLoop = () => {
    setIsLooping(!state.isLooping);
    toast({
      title: !state.isLooping ? "Herhalen aan" : "Herhalen uit",
      description: !state.isLooping ? "De audio zal blijven herhalen" : "De audio zal stoppen na afloop"
    });
  };

  const handleProgressChange = (newValue: number[]) => {
    const audio = audioRef.current;
    if (!audio || isLiveStream) return;
    
    const newTime = newValue[0];
    audio.currentTime = newTime;
  };

  const handleVolumeChange = (newValue: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = newValue[0];
    
    if (isCrossfading && nextAudioRef.current) {
      const currentRatio = audio.volume / volume;
      const nextRatio = nextAudioRef.current.volume / volume;
      
      audio.volume = newVolume * currentRatio;
      nextAudioRef.current.volume = newVolume * nextRatio;
    } else {
      audio.volume = newVolume;
    }
    
    setVolume(newVolume);
  };

  const skipTime = (amount: number) => {
    const audio = audioRef.current;
    if (!audio || isLiveStream) return;
    
    audio.currentTime = Math.min(Math.max(audio.currentTime + amount, 0), duration);
  };

  return {
    togglePlay,
    handleRetry,
    toggleLoop,
    handleProgressChange,
    handleVolumeChange,
    skipTime
  };
};
