
import { useEffect } from "react";

interface UseCrossfadeProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  nextAudioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  isLoaded: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  nextAudioUrl?: string;
  isCrossfading: boolean;
  setIsCrossfading: (crossfading: boolean) => void;
  crossfadeTimeoutRef: React.MutableRefObject<number | null>;
  isLiveStream: boolean;
  onCrossfadeStart?: () => void;
  onEnded?: () => void;
}

export const useCrossfade = ({
  audioRef,
  nextAudioRef,
  isPlaying,
  isLoaded,
  duration,
  currentTime,
  volume,
  nextAudioUrl,
  isCrossfading,
  setIsCrossfading,
  crossfadeTimeoutRef,
  isLiveStream,
  onCrossfadeStart,
  onEnded
}: UseCrossfadeProps) => {
  const CROSSFADE_DURATION = 5;

  useEffect(() => {
    if (!nextAudioUrl || !isPlaying || isCrossfading || isLiveStream) return;
    
    const audio = audioRef.current;
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
  }, [currentTime, duration, isLoaded, isPlaying, nextAudioUrl, onCrossfadeStart, onEnded, volume, isCrossfading, isLiveStream, CROSSFADE_DURATION]);

  return {};
};
