
export interface BreathingPattern {
  id: string;
  name: string;
  description?: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number;
}

export interface VoiceURLs {
  start?: string;
  inhale: string;
  hold: string;
  exhale: string;
  end?: string;
}

export interface BreathingExerciseTestProps {
  pattern: BreathingPattern | null;
}
