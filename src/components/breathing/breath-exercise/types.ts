
import { BreathingPattern } from "@/lib/types";

export type BreathingPhase = "inhale" | "hold1" | "exhale" | "hold2";
export type VoiceType = "none" | "vera" | "marco";

export interface BreathingExerciseState {
  isActive: boolean;
  currentPhase: BreathingPhase;
  currentCycle: number;
  secondsLeft: number;
  activeVoice: VoiceType;
  audioError: boolean;
  currentAudioUrl: string;
}

export interface BreathExerciseProps {
  breathingPatterns: BreathingPattern[];
  selectedPattern: BreathingPattern | null;
  onPatternChange: (patternId: string) => void;
}

export interface BreathingAudioPlayerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  currentAudioUrl: string;
  onAudioError: () => void;
}

export interface BreathingExerciseControlsProps {
  isActive: boolean;
  activeVoice: VoiceType;
  onStartWithVera: () => void;
  onStartWithMarco: () => void;
  onReset: () => void;
}

export interface BreathingPatternSelectorProps {
  breathingPatterns: BreathingPattern[];
  selectedPattern: BreathingPattern | null;
  isActive: boolean;
  onPatternChange: (patternId: string) => void;
}

export interface BreathingCycleTrackerProps {
  currentCycle: number;
  totalCycles: number;
}
