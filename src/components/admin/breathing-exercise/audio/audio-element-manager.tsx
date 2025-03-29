
import React, { useRef, useEffect } from "react";
import { toast } from "sonner";

interface AudioElementManagerProps {
  isActive: boolean;
  currentAudioUrl: string;
  onAudioError: () => void;
}

export function AudioElementManager({ 
  isActive, 
  currentAudioUrl, 
  onAudioError 
}: AudioElementManagerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "auto";
      audio.addEventListener("error", (e) => {
        console.error("Audio error:", e);
        onAudioError();
        toast.error("Fout bij het afspelen van audio. Controleer de URL.");
      });
      audio.addEventListener("canplaythrough", () => {
        console.log("Audio can play through completely:", audio.src);
      });
      audioRef.current = audio;
    }
    
    if (!endAudioRef.current) {
      const endAudio = new Audio();
      endAudio.preload = "auto";
      endAudio.addEventListener("error", (e) => {
        console.error("End audio error:", e);
        toast.error("Fout bij het afspelen van eind-audio.");
      });
      endAudioRef.current = endAudio;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (endAudioRef.current) {
        endAudioRef.current.pause();
        endAudioRef.current.src = "";
      }
    };
  }, [onAudioError]);

  // Play audio when URL changes
  useEffect(() => {
    if (!audioRef.current || !isActive || !currentAudioUrl) return;
    
    console.log("Attempting to play audio:", currentAudioUrl);
    
    try {
      const audio = audioRef.current;
      audio.pause();
      audio.currentTime = 0;
      audio.src = currentAudioUrl;
      
      // Add more explicit loading and error handling
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log("Audio playback started successfully");
        }).catch(error => {
          console.error("Error playing audio:", error);
          onAudioError();
          toast.error("Fout bij het afspelen van audio. Probeer opnieuw.");
        });
      }
    } catch (error) {
      console.error("Error setting up audio playback:", error);
      onAudioError();
      toast.error("Fout bij het instellen van audio. Controleer de URL.");
    }
  }, [currentAudioUrl, isActive, onAudioError]);

  // Pause audio when exercise is stopped
  useEffect(() => {
    if (!isActive && audioRef.current) {
      console.log("Pausing audio as exercise is not active");
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isActive]);

  // Function to play end audio
  const playEndAudio = (endUrl: string) => {
    if (!endUrl || !endAudioRef.current) return;
    
    try {
      console.log("Playing end audio:", endUrl);
      endAudioRef.current.src = endUrl;
      endAudioRef.current.load();
      const playPromise = endAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error("Error playing end audio:", err);
          toast.error("Kon eind-audio niet afspelen");
        });
      }
    } catch (error) {
      console.error("Error with end audio:", error);
    }
  };

  return (
    <>
      <audio style={{ display: 'none' }} />
      <audio style={{ display: 'none' }} />
    </>
  );
}

export function useAudioElementManager() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endAudioRef = useRef<HTMLAudioElement | null>(null);

  const playEndAudio = (endUrl: string) => {
    if (!endUrl || !endAudioRef.current) return;
    
    try {
      console.log("Playing end audio:", endUrl);
      endAudioRef.current.src = endUrl;
      endAudioRef.current.load();
      const playPromise = endAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error("Error playing end audio:", err);
          toast.error("Kon eind-audio niet afspelen");
        });
      }
    } catch (error) {
      console.error("Error with end audio:", error);
    }
  };

  return {
    audioRef,
    endAudioRef,
    playEndAudio
  };
}
