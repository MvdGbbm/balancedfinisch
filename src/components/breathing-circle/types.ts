
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
  pattern?: any; // Allow pattern to be passed for custom text
}

export interface BreathingCircleVisualProps {
  className?: string;
  children: React.ReactNode;
}

export interface BreathingPhaseDisplayProps {
  activePhase: "inhale" | "hold" | "exhale" | "rest";
  phaseTimeLeft: number;
  pattern?: any; // Allow pattern to be passed for custom text
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
}
