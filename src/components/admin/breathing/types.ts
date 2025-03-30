
export interface BreathingPattern {
  id: string;
  name: string;
  description?: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number;
  animationEnabled?: boolean;
  animationStyle?: "grow" | "glow" | "pulse" | "fade" | "none";
  animationColor?: string;
  inhaleText?: string;
  exhaleText?: string;
  hold1Text?: string;
  hold2Text?: string;
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

export interface CircleAnimationProps {
  isActive: boolean;
  currentPhase: "inhale" | "hold1" | "exhale" | "hold2";
  secondsLeft: number;
  pattern: {
    inhale: number;
    exhale: number;
  } | null;
  circleScale: number;
  setCircleScale: (scale: number) => void;
}

export interface PhaseTimerProps {
  progress: number;
  currentPhase: "inhale" | "hold1" | "exhale" | "hold2";
  currentCycle: number;
  totalCycles: number;
  secondsLeft: number;
  pattern: BreathingPattern | null;
}

export interface AudioControllerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  endAudioRef: React.RefObject<HTMLAudioElement>;
  currentAudioUrl: string;
}

export interface ControlButtonsProps {
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
  resetExercise: () => void;
  activeVoice: "vera" | "marco" | null;
}
