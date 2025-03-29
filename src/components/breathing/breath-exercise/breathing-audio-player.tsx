
import React, { useEffect } from "react";
import { BreathingAudioPlayerProps } from "./types";
import { toast } from "sonner";
import { preloadAudio } from "@/components/audio-player/utils";

export function BreathingAudioPlayer({ 
  audioRef,
  currentAudioUrl,
  onAudioError
}: BreathingAudioPlayerProps) {
  // Add debug logging to track audio playback
  useEffect(() => {
    if (currentAudioUrl) {
      console.log("Audio URL set:", currentAudioUrl);
      
      // Preload audio when URL changes
      if (currentAudioUrl) {
        preloadAudio(currentAudioUrl).then(success => {
          if (!success) {
            console.error("Failed to preload audio:", currentAudioUrl);
            if (onAudioError) onAudioError();
          } else {
            console.log("Successfully preloaded audio:", currentAudioUrl);
          }
        });
      }
    }
  }, [currentAudioUrl, onAudioError]);

  // Handle audio errors more explicitly
  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    console.error("Audio playback error:", e);
    if (onAudioError) onAudioError();
    toast.error("Kon audio niet afspelen. Controleer de audio URL.");
  };

  // Handle audio loading
  const handleCanPlayThrough = () => {
    console.log("Audio can play through:", currentAudioUrl);
  };

  return (
    <audio 
      ref={audioRef} 
      src={currentAudioUrl} 
      preload="auto" 
      onError={handleAudioError}
      onCanPlayThrough={handleCanPlayThrough}
      style={{ display: 'none' }}
    />
  );
}
