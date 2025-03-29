
export type BreathingPattern = {
  id: string;
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number;
  description?: string;
  inhaleUrl?: string;
  exhaleUrl?: string;
  hold1Url?: string;
  hold2Url?: string;
  endUrl?: string;
  startUrl?: string;
};

export type VoiceURLs = {
  start?: string;
  inhale: string;
  hold: string;
  exhale: string;
};

export interface BreathingExerciseTestProps {
  pattern: BreathingPattern | null;
}
