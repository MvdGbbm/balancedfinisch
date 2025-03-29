
import { useEffect } from "react";

interface UseAudioVolumeProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  initialVolume?: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
}

export function useAudioVolume({
  audioRef,
  initialVolume,
  setVolume
}: UseAudioVolumeProps) {
  // Handle initial volume setting
  useEffect(() => {
    if (initialVolume !== undefined && audioRef.current) {
      audioRef.current.volume = initialVolume;
      setVolume(initialVolume);
    }
  }, [initialVolume, audioRef, setVolume]);

  return {};
}
