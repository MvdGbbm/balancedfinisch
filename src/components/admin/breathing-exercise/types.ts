
export type BreathingPhase = "inhale" | "hold1" | "exhale" | "hold2";

export interface BreathingExerciseState {
  isActive: boolean;
  currentPhase: BreathingPhase;
  currentCycle: number;
  secondsLeft: number;
  progress: number;
  circleScale: number;
  activeVoice: "vera" | "marco" | null;
  exerciseCompleted: boolean;
  audioError: boolean;
  currentAudioUrl: string;
}

export interface VoiceUrls {
  start?: string;
  inhale: string;
  hold: string;
  exhale: string;
  end?: string;
}
