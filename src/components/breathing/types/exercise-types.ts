
import { BreathingPattern } from "@/lib/types";

export interface BreathExerciseProps {
  breathingPatterns: BreathingPattern[];
  selectedPattern: BreathingPattern | null;
  onPatternChange: (patternId: string) => void;
}

export interface VoiceUrls {
  inhale: string;
  hold: string;
  exhale: string;
}

export type ActiveVoice = "none" | "vera" | "marco";
