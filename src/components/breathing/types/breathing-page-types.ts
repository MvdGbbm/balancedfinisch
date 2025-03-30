
import { BreathingPhase } from "@/components/breathing/types";
import { Soundscape } from "@/lib/types";

export interface BreathingPattern {
  id: string;
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number;
  description?: string;
}

export interface VoiceURLs {
  start?: string;
  inhale: string;
  hold: string;
  exhale: string;
  end?: string;
}

export interface BreathingPageState {
  pageKey: number;
  breathingPatterns: BreathingPattern[];
  selectedPattern: BreathingPattern | null;
  isExerciseActive: boolean;
  activeVoice: "vera" | "marco" | null;
  currentPhase: BreathingPhase;
  showAnimation: boolean;
  currentCycle: number;
  exerciseCompleted: boolean;
  veraVoiceUrls: VoiceURLs;
  marcoVoiceUrls: VoiceURLs;
  voiceUrlsValidated: boolean;
  voiceVolume: number;
  musicVolume: number;
  currentTrack: Soundscape | null;
  isTrackPlaying: boolean;
  activeTab: "music";
}
