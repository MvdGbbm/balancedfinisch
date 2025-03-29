
import { useEffect } from "react";

interface UseAudioLoopingProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isLooping: boolean;
  isLiveStream: boolean;
}

export function useAudioLooping({
  audioRef,
  isLooping,
  isLiveStream
}: UseAudioLoopingProps) {
  // Handle loop mode changes
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

  return {};
}
