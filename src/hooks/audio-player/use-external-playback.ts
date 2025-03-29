
import { useEffect } from "react";

interface UseExternalPlaybackProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlayingExternal?: boolean;
  isPlaying: boolean;
  audioUrl: string;
  playDirectly: (url: string, audioElement: HTMLAudioElement | null) => boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useExternalPlayback({
  audioRef,
  isPlayingExternal,
  isPlaying,
  audioUrl,
  playDirectly,
  setIsPlaying
}: UseExternalPlaybackProps) {
  // Handle external play control changes
  useEffect(() => {
    if (isPlayingExternal !== undefined && audioRef.current) {
      console.log("External play control:", isPlayingExternal, "Current state:", isPlaying);
      if (isPlayingExternal && !isPlaying) {
        playDirectly(audioUrl, audioRef.current);
      } else if (!isPlayingExternal && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isPlayingExternal, audioUrl, isPlaying, playDirectly, audioRef, setIsPlaying]);

  return {};
}
