
export interface BreathingCircleProps {
  duration?: number;
  inhaleDuration?: number;
  holdDuration?: number;
  exhaleDuration?: number;
  className?: string;
  onBreathComplete?: () => void;
  isActive: boolean;
  currentPhase?: "inhale" | "hold" | "exhale" | "rest";
  secondsLeft?: number;
  animationEnabled?: boolean;
  animationStyle?: "grow" | "glow" | "pulse" | "fade" | "none";
  animationColor?: string;
}

export type BreathingPhase = "inhale" | "hold" | "exhale" | "rest";
