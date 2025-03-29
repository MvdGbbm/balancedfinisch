
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseAudioInitializationProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  audioUrl: string;
  isPlayingExternal?: boolean;
  resetLoadState: () => void;
  resetErrorState: () => void;
  playDirectly: (url: string, audioElement: HTMLAudioElement | null) => boolean;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
}

export function useAudioInitialization({
  audioRef,
  audioUrl,
  isPlayingExternal,
  resetLoadState,
  resetErrorState,
  playDirectly,
  setCurrentTime
}: UseAudioInitializationProps) {
  const { validateAudioUrl } = useAudioValidation();
  
  // Handle audio URL changes
  useEffect(() => {
    console.log("Audio URL changed to:", audioUrl);
    
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.pause();
    
    setCurrentTime(0);
    resetLoadState();
    resetErrorState();
    
    if (!audioUrl) {
      console.log("Empty audio URL, not attempting to play");
      return;
    }
    
    if (isPlayingExternal) {
      console.log("External play requested for new URL:", audioUrl);
      setTimeout(() => {
        playDirectly(audioUrl, audio);
      }, 100);
    } else {
      console.log("Loading new URL without autoplay:", audioUrl);
      const validatedUrl = validateAudioUrl(audioUrl);
      if (validatedUrl) {
        audio.src = validatedUrl;
        audio.load();
      }
    }
  }, [audioUrl, isPlayingExternal, resetLoadState, resetErrorState, playDirectly, setCurrentTime]);

  return {};
}

// Import after function to avoid circular dependencies
import { useAudioValidation } from "./use-audio-validation";
