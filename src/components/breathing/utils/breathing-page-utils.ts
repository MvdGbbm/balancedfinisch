
import { BreathingPattern } from "@/components/breathing/types/breathing-page-types";
import { VoiceURLs } from "@/components/breathing/types/breathing-page-types";

// Default breathing patterns for the application
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
    inhaleText: "Inademen",
    hold1Text: "Vasthouden",
    exhaleText: "Uitademen",
    hold2Text: "Vasthouden",
    animationEnabled: true,
    animationStyle: "grow",
    animationColor: "#3b82f6"
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
    inhaleText: "Inademen",
    hold1Text: "Vasthouden",
    exhaleText: "Uitademen",
    hold2Text: "Vasthouden",
    animationEnabled: true,
    animationStyle: "pulse",
    animationColor: "#10b981"
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
    inhaleText: "Inademen",
    hold1Text: "Vasthouden",
    exhaleText: "Uitademen",
    hold2Text: "Vasthouden",
    animationEnabled: true,
    animationStyle: "glow",
    animationColor: "#8b5cf6"
  }
];

// Get a default breathing pattern
export const getDefaultBreathingPattern = (): BreathingPattern => {
  return {
    id: "default",
    name: "Standaard Ademhalingstechniek",
    inhale: 4,
    hold1: 2,
    exhale: 6,
    hold2: 0,
    cycles: 5,
    inhaleText: "Inademen",
    hold1Text: "Vasthouden",
    exhaleText: "Uitademen",
    hold2Text: "Vasthouden",
    animationEnabled: true,
    animationStyle: "grow",
    animationColor: "#3b82f6"
  };
};

// Default voice URLs
export const defaultVoiceUrls = {
  vera: {
    start: "",
    inhale: "/audio/vera/inhale.mp3",
    hold: "/audio/vera/hold.mp3",
    exhale: "/audio/vera/exhale.mp3",
    end: "/audio/vera/end.mp3"
  },
  marco: {
    start: "",
    inhale: "/audio/marco/inhale.mp3",
    hold: "/audio/marco/hold.mp3",
    exhale: "/audio/marco/exhale.mp3",
    end: "/audio/marco/end.mp3"
  }
};

// Convert VoiceURLs to a simple string record for validation
const voiceURLsToRecord = (urls: VoiceURLs): Record<string, string> => {
  const record: Record<string, string> = {};
  
  if (urls.start) record.start = urls.start;
  if (urls.inhale) record.inhale = urls.inhale;
  if (urls.hold) record.hold = urls.hold;
  if (urls.exhale) record.exhale = urls.exhale;
  if (urls.end) record.end = urls.end;
  
  return record;
};

// Validate audio files
export const validateAudioFiles = async (urls: VoiceURLs, voice: string): Promise<boolean> => {
  // Convert VoiceURLs to a record for validation
  const urlsRecord = voiceURLsToRecord(urls);
  
  // We'll check if each URL is valid by attempting to load it
  const urlsToCheck = Object.values(urlsRecord).filter(url => url && url.trim() !== "");
  
  if (urlsToCheck.length === 0) {
    console.warn(`No valid URLs to check for ${voice}`);
    return false;
  }
  
  try {
    const promises = urlsToCheck.map(url => {
      return new Promise<boolean>((resolve) => {
        const audio = new Audio();
        audio.oncanplaythrough = () => {
          resolve(true);
        };
        audio.onerror = () => {
          console.error(`Error loading audio from URL: ${url}`);
          resolve(false);
        };
        audio.src = url;
        audio.load();
      });
    });
    
    const results = await Promise.all(promises);
    return results.every(result => result);
  } catch (error) {
    console.error(`Error validating audio files for ${voice}:`, error);
    return false;
  }
};

// Handle visibility change for page refresh
export const handleVisibilityChange = (lastTimestamp: number, forcePageReload: () => void) => {
  if (document.visibilityState === "visible") {
    const now = Date.now();
    const timeDifference = now - lastTimestamp;
    
    // If the page has been hidden for more than 5 minutes, force a reload
    if (timeDifference > 5 * 60 * 1000) {
      console.log("Page was hidden for more than 5 minutes, forcing reload");
      localStorage.setItem('breathing_cache_timestamp', now.toString());
      forcePageReload();
    }
  }
};
