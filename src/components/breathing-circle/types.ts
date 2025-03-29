
export type BreathingPhase = "inhale" | "hold" | "exhale" | "rest";

export interface BreathingCircleProps {
  inhaleDuration?: number;
  holdDuration?: number;
  exhaleDuration?: number;
  className?: string;
  onBreathComplete?: () => void;
  isActive?: boolean;
  currentPhase?: BreathingPhase;
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
  activePhase: BreathingPhase;
  phaseTimeLeft: number;
}
