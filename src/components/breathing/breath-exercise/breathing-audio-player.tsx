
import React, { useEffect } from "react";
import { BreathingAudioPlayerProps } from "./types";
import { toast } from "sonner";

export function BreathingAudioPlayer({ 
  audioRef,
  currentAudioUrl,
  onAudioError
}: BreathingAudioPlayerProps) {
  // Add debug logging to track audio playback
  useEffect(() => {
    if (currentAudioUrl) {
      console.log("Audio URL set:", currentAudioUrl);
    }
  }, [currentAudioUrl]);

  // Handle audio errors more explicitly
  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    console.error("Audio playback error:", e);
    if (onAudioError) onAudioError();
    toast.error("Kon audio niet afspelen. Controleer de audio URL.");
  };

  return (
    <audio 
      ref={audioRef} 
      src={currentAudioUrl} 
      preload="auto" 
      onError={handleAudioError}
      style={{ display: 'none' }}
    />
  );
}
