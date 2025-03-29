
import { toast } from "sonner";
import { validateAudioUrl, preloadAudio } from "@/components/audio-player/utils";
import { BreathingPattern, VoiceURLs } from "../types/breathing-page-types";

export const defaultBreathingPatterns: BreathingPattern[] = [
  {
    id: "1",
    name: "4-7-8 Techniek",
    description: "Een kalmerende ademhalingstechniek die helpt bij ontspanning",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 5,
    startUrl: "",
  },
  {
    id: "2",
    name: "Box Breathing",
    description: "Vierkante ademhaling voor focus en kalmte",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4, 
    cycles: 4,
    startUrl: "",
  },
  {
    id: "3",
    name: "Relaxerende Ademhaling",
    description: "Eenvoudige techniek voor diepe ontspanning",
    inhale: 4,
    hold1: 2,
    exhale: 6,
    hold2: 0,
    cycles: 6,
    startUrl: "",
  },
];

export const defaultVoiceUrls: Record<string, VoiceURLs> = {
  vera: {
    start: "",
    inhale: "",
    hold: "",
    exhale: "",
  },
  marco: {
    start: "",
    inhale: "",
    hold: "",
    exhale: "",
  }
};

export const validateAudioFiles = async (urls: VoiceURLs, voice: string): Promise<boolean> => {
  const urlsToValidate = [urls.inhale, urls.hold, urls.exhale].filter(Boolean);
  
  if (urls.start) {
    urlsToValidate.push(urls.start);
  }
  
  if (urlsToValidate.length === 0) {
    console.log(`${voice} URLs are not complete, skipping validation`);
    return false;
  }
  
  console.log(`Validating ${voice} audio URLs...`);
  
  try {
    const validationPromises = urlsToValidate.map(url => preloadAudio(url));
    const validationResults = await Promise.all(validationPromises);
    
    const allValid = validationResults.every(result => result === true);
    
    if (allValid) {
      console.log(`All ${voice} audio files validated successfully`);
      return true;
    } else {
      console.error(`One or more ${voice} audio files failed validation`);
      return false;
    }
  } catch (error) {
    console.error(`Error validating ${voice} audio files:`, error);
    return false;
  }
};

export const handleVisibilityChange = (lastTimestamp: number, forcePageReload: () => void) => {
  if (document.visibilityState === "visible") {
    const now = Date.now();
    const fiveMinutesMs = 5 * 60 * 1000;
    
    if (now - lastTimestamp > fiveMinutesMs) {
      forcePageReload();
    } else {
      localStorage.setItem('breathing_cache_timestamp', now.toString());
    }
  }
};
