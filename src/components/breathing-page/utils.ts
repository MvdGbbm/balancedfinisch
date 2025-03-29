
import { BreathingPattern } from "../breathing-page/types";
import { validateAudioUrl } from "@/components/audio-player/utils";

// This function filters out patterns that have invalid voice guidance URLs
export function filterValidBreathingPatterns(patterns: BreathingPattern[]): BreathingPattern[] {
  if (!patterns || !Array.isArray(patterns)) {
    console.warn("Invalid breathing patterns array:", patterns);
    return [];
  }
  
  return patterns.filter(pattern => {
    return pattern && typeof pattern === 'object' &&
           pattern.id && pattern.name;
  });
}

// Used to format breathing pattern time values
export function formatBreathingTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Used to calculate the total duration of a breathing pattern
export function calculatePatternDuration(pattern: BreathingPattern | null): number {
  if (!pattern) return 0;
  
  const { inhale, hold1, exhale, hold2, cycles } = pattern;
  
  // Calculate the duration of a single cycle in seconds
  const cycleDuration = inhale + (hold1 || 0) + exhale + (hold2 || 0);
  
  // Total duration is cycles * single cycle duration
  return cycleDuration * (cycles || 10);
}

// Validates breathing sound URLs
export function validateBreathingAudioUrl(url: string | undefined | null): string {
  if (!url) return "";
  return validateAudioUrl(url);
}

// Preload audio files to check if they're valid and to improve playback experience
export async function preloadBreathingAudio(voiceUrl: string | undefined): Promise<boolean> {
  if (!voiceUrl) return false;
  
  try {
    const audio = new Audio();
    
    return new Promise((resolve) => {
      audio.oncanplaythrough = () => {
        resolve(true);
        audio.oncanplaythrough = null;
        audio.onerror = null;
      };
      
      audio.onerror = () => {
        console.error("Error preloading breathing audio:", voiceUrl);
        resolve(false);
        audio.oncanplaythrough = null;
        audio.onerror = null;
      };
      
      // Start loading the audio
      audio.src = validateAudioUrl(voiceUrl);
      audio.load();
      
      // Set a timeout in case the audio takes too long to load
      setTimeout(() => {
        if (audio.oncanplaythrough) {
          audio.oncanplaythrough = null;
          audio.onerror = null;
          resolve(false);
        }
      }, 5000);
    });
  } catch (error) {
    console.error("Error in preload breathing audio:", error);
    return false;
  }
}
