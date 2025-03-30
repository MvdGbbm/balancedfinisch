
import { useEffect } from "react";
import { validateAudioUrl } from "@/components/audio-player/utils";
import { useToast } from "@/hooks/use-toast";

interface UseAudioLoaderProps {
  audioUrl: string;
  audioRef: React.RefObject<HTMLAudioElement>;
  setIsLoaded: (loaded: boolean) => void;
  setLoadError: (error: boolean) => void;
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  setIsLiveStream: (isStream: boolean) => void;
  retryCountRef: React.MutableRefObject<number>;
  setIsRetrying: (retrying: boolean) => void;
  isPlaying: boolean;
  onError?: () => void;
}

export const useAudioLoader = ({
  audioUrl,
  audioRef,
  setIsLoaded,
  setLoadError,
  setDuration,
  setCurrentTime,
  setIsLiveStream,
  retryCountRef,
  setIsRetrying,
  isPlaying,
  onError
}: UseAudioLoaderProps) => {
  const { toast } = useToast();
  const MAX_RETRY_COUNT = 3;

  const playDirectly = (url: string, audioElement: HTMLAudioElement | null) => {
    if (!audioElement) {
      console.error("Audio element not available");
      return;
    }
    
    url = validateAudioUrl(url);
    if (!url) {
      console.error("Invalid audio URL");
      setLoadError(true);
      if (onError) onError();
      return;
    }
    
    console.log("Playing directly:", url);
    
    setLoadError(false);
    
    audioElement.src = url;
    audioElement.load();
    
    const onCanPlay = () => {
      console.log("Audio can play now:", url);
      
      audioElement.play()
        .then(() => {
          console.log("Audio playing successfully:", url);
          setIsPlaying(true);
          setIsLoaded(true);
          setLoadError(false);
          retryCountRef.current = 0;
        })
        .catch(error => {
          console.error("Error playing direct URL:", error);
          setLoadError(true);
          if (onError) onError();
        });
      audioElement.removeEventListener('canplay', onCanPlay);
    };
    
    audioElement.addEventListener('canplay', onCanPlay);
    
    const handleDirectError = (e: Event) => {
      console.error("Direct play error:", e);
      setLoadError(true);
      if (onError) onError();
      audioElement.removeEventListener('error', handleDirectError);
    };
    
    audioElement.addEventListener('error', handleDirectError);
  };

  const handleRetry = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    console.log("Manual retry requested for:", audioUrl);
    
    setLoadError(false);
    setIsRetrying(true);
    retryCountRef.current = 0;
    
    setTimeout(() => {
      playDirectly(audioUrl, audio);
      
      toast({
        title: "Opnieuw laden",
        description: "Probeert audio opnieuw te laden."
      });
    }, 100);
  };

  return {
    playDirectly,
    handleRetry
  };
};
