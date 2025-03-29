
import React, { useRef, useEffect } from "react";
import { preloadAudio } from "@/components/audio-player/utils";

export interface BreathingAudioProps {
  audioUrl: string;
  volume: number;
  play: boolean;
}

export const BreathingAudio: React.FC<BreathingAudioProps> = ({ 
  audioUrl, 
  volume, 
  play 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioUrl) {
      preloadAudio(audioUrl).then(success => {
        if (success && audioRef.current) {
          console.log("Breathing audio preloaded successfully");
        } else {
          console.warn("Failed to preload breathing audio");
        }
      });
    }
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    
    if (play) {
      audio.play().catch(err => {
        console.error("Error playing breathing audio:", err);
      });
    } else {
      audio.pause();
    }

    return () => {
      audio.pause();
    };
  }, [play, volume]);

  if (!audioUrl) return null;

  return (
    <audio 
      ref={audioRef} 
      src={audioUrl} 
      preload="auto"
      loop={true}
    />
  );
};

// For backward compatibility if imported as default
export default BreathingAudio;
