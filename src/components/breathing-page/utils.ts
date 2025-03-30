
import { BreathingPattern, BreathType, VoiceURLs } from "./types";
import { BreathingPhase } from "@/components/breathing/types";
import { validateAudioUrl, preloadAudio, checkUrlExists } from "@/components/audio-player/utils";

export const calculateBreathDuration = (pattern: BreathingPattern): number => {
  const { inhale, hold1, exhale, hold2, cycles } = pattern;
  const cycleDuration = inhale + hold1 + exhale + hold2;
  return cycleDuration * cycles;
};

export const getBreathPhase = (
  elapsedTime: number,
  pattern: BreathingPattern
): BreathingPhase => {
  const { inhale, hold1, exhale, hold2 } = pattern;
  
  // Calculate total duration of one cycle
  const cycleDuration = inhale + hold1 + exhale + hold2;
  
  // Calculate time within the current cycle
  const cycleTime = elapsedTime % cycleDuration;
  
  // Determine phase based on cycleTime
  if (cycleTime < inhale) {
    return "inhale";
  } else if (cycleTime < inhale + hold1) {
    return "hold";
  } else if (cycleTime < inhale + hold1 + exhale) {
    return "exhale";
  } else {
    return "pause";
  }
};

export const getCurrentCycle = (
  elapsedTime: number,
  pattern: BreathingPattern
): number => {
  const { inhale, hold1, exhale, hold2 } = pattern;
  const cycleDuration = inhale + hold1 + exhale + hold2;
  
  return Math.floor(elapsedTime / cycleDuration) + 1;
};

export const getVoiceUrl = (
  phase: BreathingPhase,
  voiceUrls: VoiceURLs
): string => {
  switch (phase) {
    case "inhale":
      return voiceUrls.inhale || "";
    case "hold":
      return voiceUrls.hold || "";
    case "exhale":
      return voiceUrls.exhale || "";
    case "pause":
      return voiceUrls.hold || "";
    default:
      return "";
  }
};

export const validateVoiceUrls = async (
  voiceUrls: VoiceURLs
): Promise<Record<string, boolean>> => {
  const results: Record<string, boolean> = {};
  
  for (const [key, url] of Object.entries(voiceUrls)) {
    if (url) {
      const validUrl = validateAudioUrl(url);
      if (validUrl) {
        results[key] = await checkUrlExists(validUrl);
      } else {
        results[key] = false;
      }
    } else {
      results[key] = false;
    }
  }
  
  return results;
};

export const breathTypeToLabel = (type: BreathType): string => {
  switch (type) {
    case "relaxation":
      return "Ontspanning";
    case "energy":
      return "Energie";
    case "stress":
      return "Stress Vermindering";
    case "focus":
      return "Focus";
    case "sleep":
      return "Slaap";
    default:
      return type || "Overig";
  }
};

// Add new utility functions to handle voice URLs loading and activation
export const loadVoiceUrls = (
  setVeraVoiceUrls: React.Dispatch<React.SetStateAction<VoiceURLs>>,
  setMarcoVoiceUrls: React.Dispatch<React.SetStateAction<VoiceURLs>>,
  defaultVoiceUrls: Record<string, VoiceURLs>,
  setVoiceUrlsValidated: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const savedVeraUrls = localStorage.getItem('veraVoiceUrls');
  if (savedVeraUrls) {
    try {
      const parsedUrls = JSON.parse(savedVeraUrls);
      setVeraVoiceUrls(parsedUrls);
    } catch (error) {
      console.error("Error loading Vera voice URLs:", error);
      setVeraVoiceUrls(defaultVoiceUrls.vera);
    }
  }
  
  const savedMarcoUrls = localStorage.getItem('marcoVoiceUrls');
  if (savedMarcoUrls) {
    try {
      const parsedUrls = JSON.parse(savedMarcoUrls);
      setMarcoVoiceUrls(parsedUrls);
    } catch (error) {
      console.error("Error loading Marco voice URLs:", error);
      setMarcoVoiceUrls(defaultVoiceUrls.marco);
    }
  }
  
  setVoiceUrlsValidated(true);
};

export const handleActivateVoice = async (
  voice: "vera" | "marco",
  veraVoiceUrls: VoiceURLs,
  marcoVoiceUrls: VoiceURLs,
  selectedPattern: BreathingPattern | null,
  startAudioRef: React.RefObject<HTMLAudioElement>,
  setActiveVoice: React.Dispatch<React.SetStateAction<"vera" | "marco" | null>>,
  setIsExerciseActive: React.Dispatch<React.SetStateAction<boolean>>,
  setCurrentPhase: React.Dispatch<React.SetStateAction<BreathingPhase>>,
  setShowAnimation: React.Dispatch<React.SetStateAction<boolean>>,
  setCurrentCycle: React.Dispatch<React.SetStateAction<number>>,
  setExerciseCompleted: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (!selectedPattern) {
    console.error("No breathing pattern selected");
    return;
  }

  setActiveVoice(voice);
  setIsExerciseActive(true);
  setCurrentPhase("start");
  setShowAnimation(true);
  setCurrentCycle(1);
  setExerciseCompleted(false);
  
  const voiceUrls = voice === "vera" ? veraVoiceUrls : marcoVoiceUrls;
  
  if (selectedPattern.startUrl && startAudioRef.current) {
    try {
      startAudioRef.current.src = selectedPattern.startUrl;
      startAudioRef.current.load();
      await startAudioRef.current.play();
    } catch (error) {
      console.error("Error playing start audio:", error);
    }
  }
};

export const preloadAudio = async (url: string) => {
  return new Promise<void>((resolve, reject) => {
    const audio = new Audio();
    audio.src = url;
    audio.oncanplaythrough = () => resolve();
    audio.onerror = (err) => reject(err);
    audio.load();
  });
};
