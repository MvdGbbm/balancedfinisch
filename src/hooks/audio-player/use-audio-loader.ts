
import { useEffect, useCallback, RefObject } from "react";
import { useFormatSupport } from "./use-format-support";

interface UseAudioLoaderProps {
  audioRef: RefObject<HTMLAudioElement>;
  nextAudioRef: RefObject<HTMLAudioElement>;
  audioUrl: string | undefined;
  nextAudioUrl: string | undefined;
  setIsLoaded: (loaded: boolean) => void;
  setLoadError: (error: boolean) => void;
  setIsRetrying: (retrying: boolean) => void;
  setIsLiveStream: (isLiveStream: boolean) => void;
  retryCountRef: RefObject<number>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export const useAudioLoader = ({
  audioRef,
  nextAudioRef,
  audioUrl,
  nextAudioUrl,
  setIsLoaded,
  setLoadError,
  setIsRetrying,
  setIsLiveStream,
  retryCountRef,
  isPlaying,
  setIsPlaying
}: UseAudioLoaderProps) => {
  const { checkIfLiveStream } = useFormatSupport();
  
  const handleRetry = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audioUrl) {
      console.log("Retrying audio load, count:", retryCountRef.current);
      
      setIsRetrying(true);
      setIsLoaded(false);
      
      // Max retry of 3 times
      if (retryCountRef.current < 3) {
        retryCountRef.current += 1;
        
        // Force reload the audio
        audio.src = audioUrl;
        audio.load();
        
        // If it was playing before, resume
        if (isPlaying) {
          setTimeout(() => {
            if (audio) {
              audio.play()
                .catch(err => {
                  console.error("Error during retry play:", err);
                  setIsPlaying(false);
                });
            }
          }, 500);
        }
      } else {
        console.error("Max retry count reached");
        setLoadError(true);
        setIsRetrying(false);
      }
    }
  }, [audioRef, audioUrl, isPlaying, retryCountRef, setIsLoaded, setLoadError, setIsRetrying, setIsPlaying]);
  
  // Reset state when URL changes
  useEffect(() => {
    if (!audioUrl) return;
    
    console.log("Audio URL changed to:", audioUrl);
    
    // Reset states
    setIsLoaded(false);
    setLoadError(false);
    setIsRetrying(false);
    retryCountRef.current = 0;
    
    // Check if this is a live stream
    const isLive = checkIfLiveStream(audioUrl);
    setIsLiveStream(isLive);
    console.log("Is live stream:", isLive);
    
    // Load the new audio
    const audio = audioRef.current;
    if (audio) {
      audio.src = audioUrl;
      audio.load();
    }
    
    // Preload the next audio if available
    if (nextAudioUrl && nextAudioRef.current) {
      console.log("Preloading next audio:", nextAudioUrl);
      nextAudioRef.current.src = nextAudioUrl;
      nextAudioRef.current.load();
    }
  }, [
    audioUrl, 
    nextAudioUrl, 
    audioRef, 
    nextAudioRef, 
    setIsLoaded, 
    setLoadError, 
    setIsRetrying, 
    retryCountRef,
    checkIfLiveStream,
    setIsLiveStream
  ]);
  
  return {
    handleRetry
  };
};
