
import React, { useEffect, memo } from "react";
import { BreathingAudioPlayerProps } from "./types";
import { toast } from "sonner";
import { preloadAudio } from "@/components/audio-player/utils";

export const BreathingAudioPlayer = memo(({ 
  audioRef,
  currentAudioUrl,
  onAudioError
}: BreathingAudioPlayerProps) => {
  // Add debug logging to track audio playback
  useEffect(() => {
    if (currentAudioUrl) {
      // Preload audio when URL changes
      if (currentAudioUrl) {
        // Use an abort controller for cancellable fetch operations
        const controller = new AbortController();
        
        preloadAudio(currentAudioUrl).then(success => {
          if (!success) {
            console.error("Failed to preload audio:", currentAudioUrl);
            if (onAudioError) onAudioError();
          } else {
            console.log("Successfully preloaded audio:", currentAudioUrl);
          }
        });
        
        // Cleanup function to cancel any in-progress fetch operations
        return () => {
          controller.abort();
        };
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
});

BreathingAudioPlayer.displayName = "BreathingAudioPlayer";
