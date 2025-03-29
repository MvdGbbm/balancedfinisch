
import { useRef, useEffect } from "react";
import { toast } from "sonner";

interface AudioControllerProps {
  currentAudioUrl: string;
  audioRef: React.RefObject<HTMLAudioElement>;
  endAudioRef?: React.RefObject<HTMLAudioElement>;
  isActive?: boolean;
}

export function AudioController({ currentAudioUrl, audioRef, endAudioRef, isActive = true }: AudioControllerProps) {
  // Handle audio playback
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (currentAudioUrl && isActive) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = currentAudioUrl;
      audioRef.current.load();
      
      const playAudio = () => {
        if (audioRef.current && isActive) {
          audioRef.current.play().catch(error => {
            console.error("Error playing audio:", error);
            toast.error("Kan audio niet afspelen. Controleer de URL.");
          });
        }
      };
      
      setTimeout(playAudio, 100);
    }
  }, [currentAudioUrl, isActive]);

  // Pause audio when exercise is inactive
  useEffect(() => {
    if (!isActive && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isActive]);

  return null;
}

export default AudioController;
