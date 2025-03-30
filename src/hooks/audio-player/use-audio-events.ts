
import { useEffect } from "react";
import { isStreamUrl } from "@/components/audio-player/utils";
import { useToast } from "@/hooks/use-toast";

interface UseAudioEventsProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  audioUrl: string;
  volume: number;
  isLooping: boolean;
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  setIsLoaded: (loaded: boolean) => void;
  setLoadError: (error: boolean) => void;
  setIsLiveStream: (isStream: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  retryCountRef: React.MutableRefObject<number>;
  setIsRetrying: (retrying: boolean) => void;
  crossfadeTimeoutRef: React.MutableRefObject<number | null>;
  playDirectly: (url: string, audioElement: HTMLAudioElement | null) => void;
  isPlaying: boolean;
  onEnded?: () => void;
  onError?: () => void;
  isLooping?: boolean;
  title?: string;
  onPlayPauseChange?: (isPlaying: boolean) => void;
}

export const useAudioEvents = ({
  audioRef,
  audioUrl,
  volume,
  isLooping,
  setDuration,
  setCurrentTime,
  setIsLoaded,
  setLoadError,
  setIsLiveStream,
  setIsPlaying,
  retryCountRef,
  setIsRetrying,
  crossfadeTimeoutRef,
  playDirectly,
  isPlaying,
  onEnded,
  onError,
  title,
  onPlayPauseChange
}: UseAudioEventsProps) => {
  const { toast } = useToast();
  const MAX_RETRY_COUNT = 3;

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
      
      if (isPlaying) {
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
        description: isStreamUrl(audioUrl) ? "Stream is klaar om af te spelen." : "De audio is klaar om af te spelen."
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
            playDirectly(audioUrl, audio);
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
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("progress", () => {});
      
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current);
        crossfadeTimeoutRef.current = null;
      }
    };
  }, [
    audioUrl, volume, isLooping, setDuration, setCurrentTime, 
    setIsLoaded, setLoadError, setIsLiveStream, setIsPlaying, 
    retryCountRef, setIsRetrying, crossfadeTimeoutRef, onEnded, 
    onError, onPlayPauseChange, toast, isPlaying, title, playDirectly, MAX_RETRY_COUNT
  ]);

  return {};
};
