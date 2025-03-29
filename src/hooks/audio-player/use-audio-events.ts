
import { useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseAudioEventsProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isLoaded: boolean;
  isPlaying: boolean;
  isLiveStream: boolean;
  volume: number;
  isLooping: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  setIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLiveStream: React.Dispatch<React.SetStateAction<boolean>>;
  handleError: (error: Event | Error, audioUrl: string) => boolean;
  onEnded?: () => void;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  audioUrl: string;
  title?: string;
}

export function useAudioEvents({
  audioRef,
  isLoaded,
  isPlaying,
  isLiveStream,
  volume,
  isLooping,
  setIsPlaying,
  setCurrentTime,
  setDuration,
  setIsLoaded,
  setIsLiveStream,
  handleError,
  onEnded,
  onPlayPauseChange,
  audioUrl,
  title
}: UseAudioEventsProps) {
  const { toast } = useToast();

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    console.log("Setting up audio element for:", audioUrl);
    
    const setAudioData = () => {
      console.log("Audio data loaded for:", audioUrl, "Duration:", audio.duration);
      
      if (audio.duration !== Infinity && !isNaN(audio.duration)) {
        setDuration(audio.duration);
        setIsLiveStream(false);
      } else {
        setIsLiveStream(true);
        setDuration(0);
      }
      
      setIsLoaded(true);
      
      toast({
        title: "Audio geladen",
        description: isLiveStream ? "Live stream is klaar om af te spelen." : "De audio is klaar om af te spelen."
      });
    };
    
    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      console.log("Audio ended:", audioUrl);
      
      if (!isLooping) {
        setIsPlaying(false);
        if (onPlayPauseChange) onPlayPauseChange(false);
        if (onEnded) onEnded();
      } else {
        audio.currentTime = 0;
        audio.play().catch(error => {
          console.error("Error restarting audio:", error);
        });
      }
    };

    const handleAudioError = (e: Event) => {
      handleError(e, audioUrl);
    };
    
    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleAudioError);
    
    audio.volume = volume;
    audio.loop = isLooping;
    
    audio.addEventListener("progress", () => {
      if (audio.duration === Infinity || isNaN(audio.duration)) {
        setIsLiveStream(true);
      }
    });
    
    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleAudioError);
      audio.removeEventListener("progress", () => {});
    };
  }, [audioRef, audioUrl, toast, isLiveStream, volume, isLooping, setDuration, setCurrentTime, setIsLoaded, setIsLiveStream, handleError, onEnded, onPlayPauseChange, setIsPlaying]);

  // Handle play/pause toggles
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    console.log("Toggle play, current state:", isPlaying);
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (onPlayPauseChange) onPlayPauseChange(false);
      
      toast({
        title: "Gepauzeerd",
        description: "De audio is gepauzeerd."
      });
    } else {
      if (!isLoaded) {
        console.log("Not loaded yet, cannot play");
        return;
      }

      audio.play()
        .then(() => {
          setIsPlaying(true);
          if (onPlayPauseChange) onPlayPauseChange(true);
          
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
  }, [isPlaying, isLoaded, audioRef, onPlayPauseChange, title, toast, setIsPlaying]);

  return {
    togglePlay
  };
}
