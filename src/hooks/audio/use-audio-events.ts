
import { useEffect } from "react";
import { RefObject, MutableRefObject } from "react";
import { Toast } from "@/hooks/use-toast";
import { AudioPlayerState, MAX_RETRY_COUNT } from "./types";
import { validateAudioUrl, checkIfLiveStream, playDirectly } from "./utils";

interface UseAudioEventsProps {
  state: AudioPlayerState;
  audioRef: RefObject<HTMLAudioElement>;
  setDuration: (value: number) => void;
  setCurrentTime: (value: number) => void;
  setIsLoaded: (value: boolean) => void;
  setLoadError: (value: boolean) => void;
  setIsPlaying: (value: boolean) => void;
  setIsLiveStream: (value: boolean) => void;
  retryCountRef: MutableRefObject<number>;
  setIsRetrying: (value: boolean) => void;
  toast: Toast;
  onEnded?: () => void;
  onError?: () => void;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  audioUrl: string;
  isPlayingExternal?: boolean;
  crossfadeTimeoutRef: MutableRefObject<number | null>;
  isCrossfading: boolean;
}

export const useAudioEvents = ({
  state,
  audioRef,
  setDuration,
  setCurrentTime,
  setIsLoaded,
  setLoadError,
  setIsPlaying,
  setIsLiveStream,
  retryCountRef,
  setIsRetrying,
  toast,
  onEnded,
  onError,
  onPlayPauseChange,
  audioUrl,
  isPlayingExternal,
  crossfadeTimeoutRef,
  isCrossfading
}: UseAudioEventsProps) => {
  const { isLooping } = state;

  // Set up audio event listeners
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
      setLoadError(false);
      
      if (isPlayingExternal) {
        console.log("Auto-playing after load:", audioUrl);
        audio.play()
          .then(() => {
            setIsPlaying(true);
            if (onPlayPauseChange) onPlayPauseChange(true);
            retryCountRef.current = 0;
          })
          .catch(error => {
            console.error("Error auto-playing audio:", error);
          });
      }
      
      toast({
        title: "Audio geladen",
        description: "De audio is klaar om af te spelen."
      });
    };
    
    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      console.log("Audio ended:", audioUrl);
      
      if (!isCrossfading) {
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
      }
    };

    const handleError = (e: Event) => {
      console.error("Error loading audio:", e, "URL:", audioUrl);
      setLoadError(true);
      setIsLoaded(false);
      
      if (retryCountRef.current < MAX_RETRY_COUNT) {
        retryCountRef.current++;
        setIsRetrying(true);
        
        console.log(`Retrying (${retryCountRef.current}/${MAX_RETRY_COUNT})...`);
        
        setTimeout(() => {
          try {
            const adjustedUrl = validateAudioUrl(audioUrl);
            console.log("Retrying with adjusted URL:", adjustedUrl);
            
            if (adjustedUrl) {
              playDirectly(adjustedUrl, audio, retryCountRef, setLoadError, onError, setIsPlaying, onPlayPauseChange);
            } else {
              throw new Error("Invalid URL after adjustment");
            }
            setIsRetrying(false);
          } catch (error) {
            console.error("Error retrying direct playback:", error);
            setIsRetrying(false);
            
            toast({
              variant: "destructive",
              title: "Fout bij laden",
              description: "Kon de audio niet laden. Controleer of de URL correct is."
            });
            if (onError) onError();
          }
        }, 1000);
      } else {
        console.error("Maximum retry count reached");
        setIsRetrying(false);
        
        toast({
          variant: "destructive",
          title: "Fout bij laden",
          description: "Kon de audio niet laden na meerdere pogingen. Controleer of het bestand bestaat."
        });
        if (onError) onError();
      }
    };
    
    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    
    audio.volume = audio.volume; // Initialize with current volume
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
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("progress", () => {});
      
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current);
        crossfadeTimeoutRef.current = null;
      }
    };
  }, [audioUrl, isLooping, isPlayingExternal, onEnded, onError, onPlayPauseChange, isCrossfading, setCurrentTime, setDuration, setIsLoaded, setIsLiveStream, setIsPlaying, setLoadError, toast, retryCountRef, setIsRetrying]);
};
