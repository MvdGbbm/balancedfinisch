
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
  holdEnabled?: boolean;
}

export interface BreathingCircleVisualProps {
  circleScale: number;
  transitionDuration: number;
  className?: string;
  children: React.ReactNode;
}

export interface BreathingPhaseDisplayProps {
  activePhase: "inhale" | "hold" | "exhale" | "rest";
  phaseTimeLeft: number;
}

export interface UseBreathingAnimationProps {
  inhaleDuration: number;
  holdDuration: number;
  exhaleDuration: number;
  isActive: boolean;
  currentPhase?: "inhale" | "hold" | "exhale" | "rest";
  secondsLeft?: number;
  onBreathComplete?: () => void;
}

export interface BreathingAnimationState {
  phase: "inhale" | "hold" | "exhale" | "rest";
  progress: number;
  phaseTimeLeft: number;
  circleScale: number;
}
