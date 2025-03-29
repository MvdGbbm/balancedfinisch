
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
    return BreathingPhase.INHALE;
  } else if (cycleTime < inhale + hold1) {
    return BreathingPhase.HOLD_AFTER_INHALE;
  } else if (cycleTime < inhale + hold1 + exhale) {
    return BreathingPhase.EXHALE;
  } else {
    return BreathingPhase.HOLD_AFTER_EXHALE;
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
    case BreathingPhase.INHALE:
      return voiceUrls.inhale || "";
    case BreathingPhase.HOLD_AFTER_INHALE:
      return voiceUrls.holdAfterInhale || "";
    case BreathingPhase.EXHALE:
      return voiceUrls.exhale || "";
    case BreathingPhase.HOLD_AFTER_EXHALE:
      return voiceUrls.holdAfterExhale || "";
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
      results[key] = validUrl ? await checkUrlExists(validUrl) : false;
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
