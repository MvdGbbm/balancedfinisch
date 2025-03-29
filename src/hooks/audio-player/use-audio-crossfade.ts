
import { useRef, useEffect, useState } from "react";

interface UseAudioCrossfadeProps {
  isPlaying: boolean;
  isLoaded: boolean;
  duration: number;
  currentTime: number;
  nextAudioUrl?: string;
  volume: number;
  onEnded?: () => void;
  onCrossfadeStart?: () => void;
  isLiveStream: boolean;
}

export function useAudioCrossfade({
  isPlaying,
  isLoaded,
  duration,
  currentTime,
  nextAudioUrl,
  volume,
  onEnded,
  onCrossfadeStart,
  isLiveStream
}: UseAudioCrossfadeProps) {
  const [isCrossfading, setIsCrossfading] = useState(false);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const crossfadeTimeoutRef = useRef<number | null>(null);
  
  const CROSSFADE_DURATION = 5;

  // Handle crossfading between the current and next audio
  useEffect(() => {
    if (!nextAudioUrl || !isPlaying || isCrossfading || isLiveStream) return;
    
    const audio = document.querySelector('audio');
    const nextAudio = nextAudioRef.current;
    
    if (!audio || !nextAudio || !isLoaded || duration === 0) return;
    
    if (duration - currentTime <= CROSSFADE_DURATION && duration > CROSSFADE_DURATION) {
      if (crossfadeTimeoutRef.current) return;
      
      setIsCrossfading(true);
      console.info("Starting crossfade");
      
      nextAudio.volume = 0;
      nextAudio.src = nextAudioUrl;
      nextAudio.load();
      
      nextAudio.play()
        .then(() => {
          if (onCrossfadeStart) onCrossfadeStart();
          
          const timeLeft = duration - currentTime;
          
          const fadeOutInterval = setInterval(() => {
            if (!audio) {
              clearInterval(fadeOutInterval);
              return;
            }
            
            const newVol = Math.max(0, audio.volume - (volume / (timeLeft * 10)));
            audio.volume = newVol;
            
            if (newVol <= 0.05) {
              clearInterval(fadeOutInterval);
            }
          }, 100);
          
          const fadeInInterval = setInterval(() => {
            if (!nextAudio) {
              clearInterval(fadeInInterval);
              return;
            }
            
            const newVol = Math.min(volume, nextAudio.volume + (volume / (timeLeft * 10)));
            nextAudio.volume = newVol;
            
            if (newVol >= volume - 0.05) {
              clearInterval(fadeInInterval);
            }
          }, 100);
          
          crossfadeTimeoutRef.current = window.setTimeout(() => {
            if (onEnded) onEnded();
            crossfadeTimeoutRef.current = null;
            setIsCrossfading(false);
          }, timeLeft * 1000);
        })
        .catch(error => {
          console.error("Error starting crossfade:", error);
          setIsCrossfading(false);
        });
    }
  }, [currentTime, duration, isLoaded, isPlaying, nextAudioUrl, onCrossfadeStart, onEnded, volume, isCrossfading, isLiveStream]);

  // Cleanup function for crossfade
  useEffect(() => {
    return () => {
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current);
        crossfadeTimeoutRef.current = null;
      }
    };
  }, []);

  const resetCrossfade = () => {
    setIsCrossfading(false);
    if (crossfadeTimeoutRef.current) {
      clearTimeout(crossfadeTimeoutRef.current);
      crossfadeTimeoutRef.current = null;
    }
    if (nextAudioRef.current) {
      nextAudioRef.current.pause();
    }
  };

  return {
    nextAudioRef,
    isCrossfading,
    resetCrossfade
  };
}
