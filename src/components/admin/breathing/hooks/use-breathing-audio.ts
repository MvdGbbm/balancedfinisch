
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { BreathingPattern } from "../types";

export function useBreathingAudio(
  pattern: BreathingPattern | null,
  isActive: boolean,
  currentPhase: "inhale" | "hold1" | "exhale" | "hold2",
  activeVoice: "vera" | "marco" | null,
  voiceUrls: {
    vera: { inhale: string; hold: string; exhale: string };
    marco: { inhale: string; hold: string; exhale: string };
  }
) {
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>("");
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endAudioRef = useRef<HTMLAudioElement | null>(null);

  // Update audio URL based on phase and voice
  useEffect(() => {
    if (!pattern) return;
    
    let url = "";
    if (activeVoice === "vera") {
      switch (currentPhase) {
        case "inhale":
          url = voiceUrls.vera.inhale || "";
          break;
        case "hold1":
        case "hold2":
          // Only set hold URL if the hold duration is 1 or more seconds
          if ((currentPhase === "hold1" && pattern.hold1 >= 1) || 
              (currentPhase === "hold2" && pattern.hold2 >= 1)) {
            url = voiceUrls.vera.hold || "";
          }
          break;
        case "exhale":
          url = voiceUrls.vera.exhale || "";
          break;
      }
    } else if (activeVoice === "marco") {
      switch (currentPhase) {
        case "inhale":
          url = voiceUrls.marco.inhale || "";
          break;
        case "hold1":
        case "hold2":
          // Only set hold URL if the hold duration is 1 or more seconds
          if ((currentPhase === "hold1" && pattern.hold1 >= 1) || 
              (currentPhase === "hold2" && pattern.hold2 >= 1)) {
            url = voiceUrls.marco.hold || "";
          }
          break;
        case "exhale":
          url = voiceUrls.marco.exhale || "";
          break;
      }
    } else {
      switch (currentPhase) {
        case "inhale":
          url = pattern.inhaleUrl || "";
          break;
        case "hold1":
          // Only set hold1 URL if the hold1 duration is 1 or more seconds
          if (pattern.hold1 >= 1) {
            url = pattern.hold1Url || "";
          }
          break;
        case "exhale":
          url = pattern.exhaleUrl || "";
          break;
        case "hold2":
          // Only set hold2 URL if the hold2 duration is 1 or more seconds
          if (pattern.hold2 >= 1) {
            url = pattern.hold2Url || "";
          }
          break;
      }
    }
    
    setCurrentAudioUrl(url);
    setAudioError(false);
  }, [currentPhase, activeVoice, pattern, voiceUrls]);

  // Play end audio when exercise completes
  const playEndAudio = (endUrl?: string) => {
    if (!endUrl) return;
    
    try {
      if (endAudioRef.current) {
        endAudioRef.current.src = endUrl;
        endAudioRef.current.load();
        endAudioRef.current.play().catch(err => {
          console.error("Error playing end audio:", err);
        });
      }
    } catch (error) {
      console.error("Error with end audio:", error);
    }
  };

  return {
    audioRef,
    endAudioRef,
    currentAudioUrl,
    audioError,
    playEndAudio
  };
}
