
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAudioValidation } from "./use-audio-validation";

interface UseAudioLoaderProps {
  audioUrl: string;
  isPlayingExternal?: boolean;
  onPlayPauseChange?: (isPlaying: boolean) => void;
}

export function useAudioLoader({
  audioUrl,
  isPlayingExternal,
  onPlayPauseChange
}: UseAudioLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLiveStream, setIsLiveStream] = useState(false);
  const [duration, setDuration] = useState(0);
  const { toast } = useToast();
  const { validateAudioUrl, isStreamUrl } = useAudioValidation();
  
  const playDirectly = useCallback((url: string, audioElement: HTMLAudioElement | null) => {
    if (!audioElement) {
      console.error("Audio element not available");
      return false;
    }
    
    url = validateAudioUrl(url) || '';
    if (!url) {
      console.error("Invalid audio URL");
      return false;
    }
    
    console.log("Playing directly:", url);
    
    const isAAC = url.toLowerCase().endsWith('.aac') || 
                  url.toLowerCase().includes('.m4a');
    
    const potentialLiveStream = isStreamUrl(url);
    if (potentialLiveStream) {
      setIsLiveStream(true);
      setDuration(0);
    } else {
      setIsLiveStream(false);
    }
    
    audioElement.src = url;
    
    if (isAAC) {
      try {
        const source = document.createElement('source');
        source.src = url;
        source.type = url.toLowerCase().endsWith('.aac') ? 'audio/aac' : 'audio/mp4';
        
        audioElement.innerHTML = '';
        audioElement.appendChild(source);
        console.log("Added source element with type:", source.type);
      } catch (e) {
        console.warn("Couldn't add source element, falling back to basic src attribute", e);
        audioElement.src = url;
      }
    }
    
    audioElement.load();
    
    const onCanPlay = () => {
      console.log("Audio can play now:", url);
      
      audioElement.play()
        .then(() => {
          console.log("Audio playing successfully:", url);
          if (onPlayPauseChange) onPlayPauseChange(true);
          setIsLoaded(true);
          return true;
        })
        .catch(error => {
          console.error("Error playing direct URL:", error);
          return false;
        });
      audioElement.removeEventListener('canplay', onCanPlay);
    };
    
    audioElement.addEventListener('canplay', onCanPlay);
    
    const handleDirectError = (e: Event) => {
      console.error("Direct play error:", e);
      audioElement.removeEventListener('error', handleDirectError);
    };
    
    audioElement.addEventListener('error', handleDirectError);
    
    return true;
  }, [validateAudioUrl, isStreamUrl, onPlayPauseChange]);

  const resetLoadState = useCallback(() => {
    setIsLoaded(false);
  }, []);

  // Check if audio URL is a live stream
  useEffect(() => {
    setIsLiveStream(isStreamUrl(audioUrl));
  }, [audioUrl, isStreamUrl]);

  return {
    isLoaded,
    isLiveStream,
    duration,
    setDuration,
    setIsLoaded,
    playDirectly,
    resetLoadState
  };
}
