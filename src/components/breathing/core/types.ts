
export type BreathingPhase = "inhale" | "hold" | "exhale" | "pause" | "rest" | "start";

export interface BreathingSettings {
  inhaleDuration: number;  // in seconds
  holdDuration: number;    // in seconds
  exhaleDuration: number;  // in seconds
  pauseDuration: number;   // in seconds
  cycles: number;
  animated: boolean;
  animationStyle?: "grow" | "glow" | "pulse" | "fade" | "none";
  animationColor?: string;
  showCycleCount?: boolean;
  circleSize?: "small" | "medium" | "large";
  textSize?: "small" | "medium" | "large";
}

export interface BreathingState {
  isActive: boolean;
  currentPhase: BreathingPhase;
  currentCycle: number;
  secondsLeft: number;
  progress: number;
  circleScale: number;
  exerciseCompleted: boolean;
}

export interface BreathingCircleProps {
  state: BreathingState;
  settings: BreathingSettings;
  onPhaseChange?: (phase: BreathingPhase) => void;
}

export interface BreathingAudioProps {
  voiceUrls: {
    start?: string;
    inhale: string;
    hold: string;
    exhale: string;
    end?: string;
  } | null;
  isActive: boolean;
  currentPhase: BreathingPhase;
  volume: number;
  skipPhase?: BreathingPhase | null;
}
