
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { VoiceUrls } from "../types/exercise-types";

export function useBreathingAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>("");

  // Reset audio when exercise is paused or needs refreshing
  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAudioError(false);
  };

  // Update audio URL based on voice selection and phase
  const updateCurrentAudioUrl = (
    activeVoice: "vera" | "marco" | "none",
    currentPhase: "inhale" | "hold1" | "exhale" | "hold2",
    veraVoiceUrls: VoiceUrls,
    marcoVoiceUrls: VoiceUrls,
    selectedPattern?: any
  ) => {
    if (!selectedPattern) return "";

    let url = "";
    
    if (activeVoice === "vera") {
      // Use Vera voice URLs
      switch (currentPhase) {
        case "inhale":
          url = veraVoiceUrls.inhale || "";
          break;
        case "hold1":
        case "hold2":
          url = veraVoiceUrls.hold || "";
          break;
        case "exhale":
          url = veraVoiceUrls.exhale || "";
          break;
      }
    } else if (activeVoice === "marco") {
      // Use Marco voice URLs
      switch (currentPhase) {
        case "inhale":
          url = marcoVoiceUrls.inhale || "";
          break;
        case "hold1":
        case "hold2":
          url = marcoVoiceUrls.hold || "";
          break;
        case "exhale":
          url = marcoVoiceUrls.exhale || "";
          break;
      }
    } else {
      // Default to pattern URLs if no voice is selected
      switch (currentPhase) {
        case "inhale":
          url = selectedPattern.inhaleUrl || "";
          break;
        case "hold1":
          url = selectedPattern.hold1Url || "";
          break;
        case "exhale":
          url = selectedPattern.exhaleUrl || "";
          break;
        case "hold2":
          url = selectedPattern.hold2Url || "";
          break;
      }
    }
    
    setCurrentAudioUrl(url);
    setAudioError(false);
    return url;
  };

  // Play audio for the current phase
  const playAudio = (
    isActive: boolean, 
    url: string
  ) => {
    if (!url || !isActive || !audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.src = url;
    audioRef.current.load();
    
    setTimeout(() => {
      if (audioRef.current && isActive) {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
          setAudioError(true);
          toast.error("Audio kon niet worden afgespeeld");
        });
      }
    }, 100);
  };

  return { 
    audioRef, 
    audioError, 
    currentAudioUrl, 
    setCurrentAudioUrl,
    resetAudio, 
    updateCurrentAudioUrl,
    playAudio
  };
}
