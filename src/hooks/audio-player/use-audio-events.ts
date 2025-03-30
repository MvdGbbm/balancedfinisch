
import { useCallback, useEffect, RefObject } from "react";

interface UseAudioEventsProps {
  audioRef: RefObject<HTMLAudioElement>;
  nextAudioRef: RefObject<HTMLAudioElement>;
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  setIsLoaded: (loaded: boolean) => void;
  setLoadError: (error: boolean) => void;
  setIsRetrying: (retrying: boolean) => void;
  setIsCrossfading: (crossfading: boolean) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  isLiveStream: boolean;
  retryCountRef: RefObject<number>;
  crossfadeTimeoutRef: RefObject<number | null>;
  volume: number;
}

export const useAudioEvents = ({
  audioRef,
  nextAudioRef,
  setDuration,
  setCurrentTime,
  setIsLoaded,
  setLoadError,
  setIsRetrying,
  setIsCrossfading,
  isPlaying,
  setIsPlaying,
  isLiveStream,
  retryCountRef,
  crossfadeTimeoutRef,
  volume
}: UseAudioEventsProps) => {
  const handleLoadedMetadata = useCallback(() => {
    console.log("Audio loaded metadata");
    const audio = audioRef.current;
    if (audio) {
      // Round to nearest second for consistency
      const durationValue = Math.round(isNaN(audio.duration) ? 0 : audio.duration);
      setDuration(durationValue);
      setIsLoaded(true);
      setLoadError(false);
    }
  }, [audioRef, setDuration, setIsLoaded, setLoadError]);

  const handleLoadError = useCallback(() => {
    console.error("Error loading audio");
    setLoadError(true);
    setIsLoaded(false);
    setIsRetrying(false);
    if (isPlaying) {
      setIsPlaying(false);
    }
  }, [setLoadError, setIsLoaded, setIsRetrying, isPlaying, setIsPlaying]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  }, [audioRef, setCurrentTime]);

  const handleEnded = useCallback(() => {
    console.log("Audio ended");
    setCurrentTime(0);
    setIsPlaying(false);
    
    // If a crossfade is in progress, we should not stop playing
    if (crossfadeTimeoutRef.current !== null) {
      console.log("Crossfade in progress, not stopping playback");
      setIsCrossfading(false);
      return;
    }
  }, [setCurrentTime, setIsPlaying, crossfadeTimeoutRef, setIsCrossfading]);

  // Set up event listeners
  useEffect(() => {
    const audio = audioRef.current;
    const nextAudio = nextAudioRef.current;
    
    if (audio) {
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('error', handleLoadError);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('error', handleLoadError);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [
    audioRef, 
    nextAudioRef,
    handleLoadedMetadata, 
    handleLoadError, 
    handleTimeUpdate, 
    handleEnded
  ]);
  
  return {
    handleLoadedMetadata,
    handleLoadError,
    handleTimeUpdate,
    handleEnded
  };
};
