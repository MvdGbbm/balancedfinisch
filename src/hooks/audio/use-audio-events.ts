
import { useEffect } from "react";
import { toast } from "sonner";
import { checkIfLiveStream } from "./utils";

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
  onEnded,
  onError,
  onPlayPauseChange,
  audioUrl,
  isPlayingExternal,
  crossfadeTimeoutRef,
  isCrossfading
}) => {
  // Handle duration and current time updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleDurationChange = () => {
      // Handle both normal duration and infinite duration (live streams)
      const newDuration = audio.duration;
      if (isFinite(newDuration) && !isNaN(newDuration)) {
        setDuration(newDuration);
      } else {
        // Infinite duration usually indicates a live stream
        setDuration(0);
        setIsLiveStream(true);
      }
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [audioRef, setDuration, setCurrentTime, setIsLiveStream]);
  
  // Handle load and error events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleLoadedData = () => {
      console.log("Audio loaded:", audioUrl);
      setIsLoaded(true);
      setLoadError(false);
      
      // Check if this is a live stream using both duration and URL pattern
      const isInfiniteDuration = !isFinite(audio.duration) || isNaN(audio.duration);
      const isLiveUrl = checkIfLiveStream(audioUrl);
      
      if (isInfiniteDuration || isLiveUrl) {
        console.log("Detected live stream:", audioUrl);
        setIsLiveStream(true);
        
        toast("Live stream gedetecteerd");
      } else {
        setIsLiveStream(false);
      }
    };
    
    const handleLoadError = (e: Event) => {
      console.error("Audio load error:", e);
      
      // Only set error state if we're not crossfading (which can cause temporary errors)
      if (!isCrossfading) {
        setLoadError(true);
        setIsPlaying(false);
        
        // Call error callback if provided
        if (onError) onError();
        
        // Don't auto-retry if max retries reached
        if (retryCountRef.current < 3) {
          console.log(`Auto-retrying (${retryCountRef.current + 1}/3)...`);
          retryCountRef.current++;
          setIsRetrying(true);
          
          // Clean up and retry
          setTimeout(() => {
            if (audio) {
              audio.load();
              setIsRetrying(false);
            }
          }, 1500);
        } else {
          console.log("Max retries reached, giving up");
          toast("Kon audio niet laden na meerdere pogingen");
        }
      }
    };
    
    const handlePlayEvent = () => {
      console.log("Audio play event triggered");
      setIsPlaying(true);
      if (onPlayPauseChange) onPlayPauseChange(true);
    };
    
    const handlePauseEvent = () => {
      console.log("Audio pause event triggered");
      // Only update state if we're not in the middle of crossfading
      if (!isCrossfading) {
        setIsPlaying(false);
        if (onPlayPauseChange) onPlayPauseChange(false);
      }
    };
    
    const handleEndedEvent = () => {
      console.log("Audio ended");
      
      // If audio is not looping and we're not crossfading
      if (!audio.loop && !isCrossfading) {
        setIsPlaying(false);
        if (onPlayPauseChange) onPlayPauseChange(false);
        
        // Call onEnded callback if provided
        if (onEnded) {
          onEnded();
        }
      }
      
      // If audio is looping, it will automatically restart
      if (audio.loop) {
        console.log("Audio looping");
      }
    };
    
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleLoadError);
    audio.addEventListener('play', handlePlayEvent);
    audio.addEventListener('pause', handlePauseEvent);
    audio.addEventListener('ended', handleEndedEvent);
    
    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleLoadError);
      audio.removeEventListener('play', handlePlayEvent);
      audio.removeEventListener('pause', handlePauseEvent);
      audio.removeEventListener('ended', handleEndedEvent);
    };
  }, [
    audioRef, 
    audioUrl, 
    setIsLoaded, 
    setLoadError, 
    setIsPlaying, 
    setIsLiveStream, 
    isCrossfading,
    onEnded, 
    onError, 
    onPlayPauseChange, 
    retryCountRef,
    setIsRetrying
  ]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any pending timeouts
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current);
      }
    };
  }, [crossfadeTimeoutRef]);
};
