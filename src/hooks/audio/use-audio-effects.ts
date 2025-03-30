
import { useEffect } from "react";
import { RefObject, MutableRefObject } from "react";
import { AudioPlayerState, CROSSFADE_DURATION } from "./types";

interface UseAudioEffectsProps {
  state: AudioPlayerState;
  audioRef: RefObject<HTMLAudioElement>;
  nextAudioRef: RefObject<HTMLAudioElement>;
  audioUrl: string;
  nextAudioUrl?: string;
  crossfadeTimeoutRef: MutableRefObject<number | null>;
  onCrossfadeStart?: () => void;
  onEnded?: () => void;
  setIsCrossfading: (value: boolean) => void;
  setCurrentTime: (value: number) => void;
  volume: number;
}

export const useAudioEffects = ({
  state,
  audioRef,
  nextAudioRef,
  audioUrl,
  nextAudioUrl,
  crossfadeTimeoutRef,
  onCrossfadeStart,
  onEnded,
  setIsCrossfading,
  setCurrentTime,
  volume
}: UseAudioEffectsProps) => {
  const { isPlaying, currentTime, duration, isLoaded, isCrossfading, isLiveStream, isLooping } = state;

  // Handle crossfading logic
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
            setCurrentTime(0);
          }, timeLeft * 1000);
        })
        .catch(error => {
          console.error("Error starting crossfade:", error);
          setIsCrossfading(false);
        });
    }
  }, [currentTime, duration, isLoaded, isPlaying, nextAudioUrl, onCrossfadeStart, onEnded, volume, isCrossfading, isLiveStream, setIsCrossfading, setCurrentTime]);

  // Handle looping logic
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isLiveStream) return;
    
    audio.loop = isLooping;
    
    if (isLooping) {
      const handleSeamlessLoop = () => {
        if (audio.duration > 0 && audio.currentTime >= audio.duration - 0.2) {
          const currentVolume = audio.volume;
          const currentPlaybackRate = audio.playbackRate;
          
          audio.currentTime = 0;
          audio.playbackRate = currentPlaybackRate;
          audio.volume = currentVolume;
        }
      };
      
      const intervalId = setInterval(handleSeamlessLoop, 10);
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isLooping, isLiveStream]);

  // Cleanup crossfade on unmount
  useEffect(() => {
    return () => {
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current);
        crossfadeTimeoutRef.current = null;
      }
    };
  }, []);
};
