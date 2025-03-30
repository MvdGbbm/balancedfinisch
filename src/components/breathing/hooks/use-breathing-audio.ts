
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { BreathingPhase } from "../core/types";
import { preloadAudio } from "@/components/audio-player/utils";

interface BreathingAudioConfig {
  voiceUrls: {
    start?: string;
    inhale: string;
    hold: string;
    exhale: string;
    end?: string;
  } | null;
  isActive: boolean;
  currentPhase: BreathingPhase;
  volume?: number;
  skipPhase?: BreathingPhase | null;
}

export function useBreathingAudio({
  voiceUrls,
  isActive,
  currentPhase,
  volume = 1.0,
  skipPhase = null
}: BreathingAudioConfig) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const errorCountRef = useRef<number>(0);
  const lastPhaseRef = useRef<BreathingPhase | null>(null);

  // Create audio element if it doesn't exist
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      
      audioRef.current.addEventListener('error', () => {
        console.error("Audio error occurred");
        setAudioError(true);
        errorCountRef.current++;
        
        if (errorCountRef.current === 3) {
          toast.error("Fout bij het afspelen van audio. Controleer de verbinding.");
        }
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [volume]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Validate voice URLs
  const validateVoiceUrls = useCallback(async () => {
    if (!voiceUrls) return false;
    
    try {
      const urlsToValidate = [
        voiceUrls.inhale,
        voiceUrls.hold,
        voiceUrls.exhale
      ].filter(Boolean);
      
      if (voiceUrls.start) urlsToValidate.push(voiceUrls.start);
      if (voiceUrls.end) urlsToValidate.push(voiceUrls.end);
      
      const validationPromises = urlsToValidate.map(url => preloadAudio(url));
      const results = await Promise.all(validationPromises);
      
      const allValid = results.every(result => result === true);
      
      if (!allValid) {
        toast.error("Sommige audio-URLs zijn ongeldig. Controleer de instellingen.");
        setAudioError(true);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error validating audio URLs:", error);
      setAudioError(true);
      return false;
    }
  }, [voiceUrls]);

  // Play audio for the current phase
  const playAudioForPhase = useCallback(async (phase: BreathingPhase) => {
    if (!voiceUrls || !isActive || !audioRef.current || isLoading || phase === skipPhase) {
      return;
    }
    
    let audioUrl = '';
    
    switch (phase) {
      case "start":
        audioUrl = voiceUrls.start || "";
        break;
      case "inhale":
        audioUrl = voiceUrls.inhale;
        break;
      case "hold":
        audioUrl = voiceUrls.hold;
        break;
      case "exhale":
        audioUrl = voiceUrls.exhale;
        break;
      case "rest":
        audioUrl = voiceUrls.end || "";
        break;
      default:
        return; // No audio for other phases
    }
    
    if (!audioUrl) return;
    
    try {
      setIsLoading(true);
      setAudioError(false);
      
      const isValid = await preloadAudio(audioUrl);
      if (!isValid) {
        throw new Error(`Failed to load audio for ${phase}`);
      }
      
      audioRef.current.src = audioUrl;
      audioRef.current.currentTime = 0;
      
      await audioRef.current.play();
      errorCountRef.current = 0;
    } catch (error) {
      console.error(`Error playing ${phase} audio:`, error);
      setAudioError(true);
      
      if (errorCountRef.current < 5) {
        errorCountRef.current++;
        if (errorCountRef.current === 3) {
          toast.error("Fout bij het afspelen van audio. Probeer het opnieuw.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [voiceUrls, isActive, isLoading, skipPhase]);

  // Play audio when phase changes
  useEffect(() => {
    if (lastPhaseRef.current !== currentPhase) {
      if (isActive && voiceUrls) {
        playAudioForPhase(currentPhase);
      }
      lastPhaseRef.current = currentPhase;
    }
  }, [currentPhase, isActive, voiceUrls, playAudioForPhase]);

  // Validate URLs when they change
  useEffect(() => {
    if (voiceUrls && isActive) {
      validateVoiceUrls();
    }
  }, [voiceUrls, isActive, validateVoiceUrls]);

  // Stop audio when inactive
  useEffect(() => {
    if (!isActive && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isActive]);

  return {
    audioRef,
    audioError,
    isLoading,
    playAudio: playAudioForPhase,
    stopAudio: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    },
    validateVoiceUrls
  };
}
