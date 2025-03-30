
import { useEffect } from "react";

interface UseUrlChangeProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  audioUrl: string;
  setCurrentTime: (time: number) => void;
  setIsLoaded: (loaded: boolean) => void;
  setLoadError: (error: boolean) => void;
  setIsRetrying: (retrying: boolean) => void;
  setIsCrossfading: (crossfading: boolean) => void;
  setIsLiveStream: (isStream: boolean) => void;
  retryCountRef: React.MutableRefObject<number>;
  crossfadeTimeoutRef: React.MutableRefObject<number | null>;
  isPlaying: boolean;
  playDirectly: (url: string, audioElement: HTMLAudioElement | null) => void;
  checkIfLiveStream: (url: string) => boolean;
}

export const useUrlChange = ({
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
}: UseUrlChangeProps) => {
  useEffect(() => {
    console.log("Audio URL changed to:", audioUrl);
    
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.pause();
    
    setCurrentTime(0);
    setIsLoaded(false);
    setLoadError(false);
    setIsRetrying(false);
    setIsCrossfading(false);
    setIsLiveStream(checkIfLiveStream(audioUrl));
    retryCountRef.current = 0;
    
    if (crossfadeTimeoutRef.current) {
      clearTimeout(crossfadeTimeoutRef.current);
      crossfadeTimeoutRef.current = null;
    }
    
    if (!audioUrl) {
      console.log("Empty audio URL, not attempting to play");
      return;
    }
    
    if (isPlaying) {
      console.log("External play requested for new URL:", audioUrl);
      setTimeout(() => {
        playDirectly(audioUrl, audio);
      }, 100);
    }
  }, [audioUrl, isPlaying]);

  return {};
};
