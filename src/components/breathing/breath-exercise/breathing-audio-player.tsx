
import React, { useEffect, memo, useState } from "react";
import { BreathingAudioPlayerProps } from "./types";
import { toast } from "sonner";
import { preloadAudio } from "@/components/audio-player/utils";

export const BreathingAudioPlayer = memo(({ 
  audioRef,
  currentAudioUrl,
  onAudioError
}: BreathingAudioPlayerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);

  // Log component rendering
  useEffect(() => {
    console.log("BreathingAudioPlayer rendered with URL:", currentAudioUrl);
  }, [currentAudioUrl]);

  // Add debug logging to track audio playback
  useEffect(() => {
    if (!currentAudioUrl) return;
    
    console.log("Attempting to load audio URL:", currentAudioUrl);
    setIsLoading(true);
    
    // Abort controller to cancel fetch operations
    const controller = new AbortController();
    
    // Preload audio
    preloadAudio(currentAudioUrl)
      .then(success => {
        if (!success) {
          console.error("Failed to preload audio:", currentAudioUrl);
          setLoadAttempts(prev => prev + 1);
          if (onAudioError) onAudioError();
          toast.error("Kon audio niet vooraf laden. Controleer de URL.");
        } else {
          console.log("Successfully preloaded audio:", currentAudioUrl);
          setLoadAttempts(0);
          
          // Manually set the src on the audio element
          if (audioRef.current) {
            audioRef.current.src = currentAudioUrl;
            audioRef.current.load();
          }
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error preloading audio:", error);
        setIsLoading(false);
        setLoadAttempts(prev => prev + 1);
        if (onAudioError) onAudioError();
      });
    
    // Cleanup
    return () => {
      controller.abort();
    };
  }, [currentAudioUrl, onAudioError]);

  // Retry mechanism for loading
  useEffect(() => {
    if (loadAttempts > 0 && loadAttempts < 3 && currentAudioUrl) {
      const retryTimer = setTimeout(() => {
        console.log(`Retry attempt ${loadAttempts} for loading audio:`, currentAudioUrl);
        preloadAudio(currentAudioUrl).then(success => {
          if (success) {
            console.log("Successfully preloaded audio on retry:", currentAudioUrl);
            setLoadAttempts(0);
            // Manually set the src on the audio element
            if (audioRef.current) {
              audioRef.current.src = currentAudioUrl;
              audioRef.current.load();
            }
          }
        });
      }, 1000 * loadAttempts);
      
      return () => clearTimeout(retryTimer);
    }
  }, [loadAttempts, currentAudioUrl, audioRef]);

  // Handle audio errors more explicitly
  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    console.error("Audio playback error:", e);
    if (onAudioError) onAudioError();
    toast.error("Kon audio niet afspelen. Controleer de audio URL.");
  };

  // Handle audio loading
  const handleCanPlayThrough = () => {
    console.log("Audio can play through:", currentAudioUrl);
    // Let's attempt to play if we're not already playing
    if (audioRef.current) {
      try {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Audio play error (expected if paused):", error);
          });
        }
      } catch (e) {
        console.error("Error trying to play audio:", e);
      }
    }
  };

  return (
    <>
      <audio 
        ref={audioRef} 
        src={currentAudioUrl} 
        preload="auto" 
        onError={handleAudioError}
        onCanPlayThrough={handleCanPlayThrough}
        style={{ display: 'none' }}
      />
      {isLoading && <div className="sr-only">Loading audio...</div>}
    </>
  );
});

BreathingAudioPlayer.displayName = "BreathingAudioPlayer";
