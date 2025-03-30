
import { toast } from "sonner";
import { playDirectly } from "./utils";

export const useAudioControls = ({
  state,
  audioRef,
  nextAudioRef,
  audioUrl,
  setIsPlaying,
  setVolume,
  setIsLooping,
  setLoadError,
  setIsRetrying,
  retryCountRef,
  onPlayPauseChange,
  title,
  isCrossfading
}) => {
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (state.isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (onPlayPauseChange) onPlayPauseChange(false);
    } else {
      if (state.loadError) {
        handleRetry();
        return;
      }
      
      if (isCrossfading) {
        console.log("Cannot toggle play during crossfade");
        return;
      }
      
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          if (onPlayPauseChange) onPlayPauseChange(true);
        })
        .catch(error => {
          console.error("Error playing audio:", error);
          setLoadError(true);
          
          // Show toast for playback errors
          if (error.name === 'NotAllowedError') {
            toast("Audio playback requires user interaction");
          } else {
            toast.error("Kon de audio niet afspelen. Probeer later opnieuw.");
          }
        });
    }
  };
  
  const handleRetry = () => {
    if (!audioRef.current) return;
    
    // Don't retry if we're already retrying
    if (state.isRetrying) return;
    
    setIsRetrying(true);
    
    console.log("Retrying playback with URL:", audioUrl);
    
    // Reset error state
    setLoadError(false);
    
    // If we've already tried too many times, show an error
    if (retryCountRef.current >= 3) {
      console.error("Too many retry attempts:", retryCountRef.current);
      setLoadError(true);
      setIsRetrying(false);
      toast.error("Kon de audio niet laden na meerdere pogingen");
      return;
    }
    
    retryCountRef.current += 1;
    
    playDirectly(
      audioUrl,
      audioRef.current,
      retryCountRef,
      setLoadError,
      () => {
        setIsRetrying(false);
        toast.error("Fout bij afspelen");
      },
      setIsPlaying,
      onPlayPauseChange
    );
    
    // Reset retry status after 3 seconds
    setTimeout(() => {
      setIsRetrying(false);
    }, 3000);
  };
  
  const toggleLoop = () => {
    if (!audioRef.current) return;
    
    const newLoopState = !state.isLooping;
    audioRef.current.loop = newLoopState;
    setIsLooping(newLoopState);
    
    if (nextAudioRef.current) {
      nextAudioRef.current.loop = newLoopState;
    }
    
    // Show user feedback
    toast(
      newLoopState ? "Herhalen ingeschakeld" : "Herhalen uitgeschakeld",
      { description: title }
    );
  };
  
  const handleProgressChange = (newValue: number[]) => {
    if (!audioRef.current || !state.duration) return;
    
    const newTime = newValue[0];
    audioRef.current.currentTime = newTime;
  };
  
  const handleVolumeChange = (newValue: number[]) => {
    if (!audioRef.current) return;
    
    const newVolume = newValue[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (nextAudioRef.current) {
      nextAudioRef.current.volume = newVolume;
    }
  };
  
  const skipTime = (amount: number) => {
    if (!audioRef.current) return;
    
    const newTime = Math.max(0, Math.min(audioRef.current.currentTime + amount, state.duration));
    audioRef.current.currentTime = newTime;
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
