
import { BreathingPhase } from "./types";

export const getTransitionDuration = (
  phase: BreathingPhase,
  inhaleDuration: number,
  holdDuration: number,
  exhaleDuration: number
): number => {
  switch (phase) {
    case "inhale":
      return inhaleDuration;
    case "hold":
      return holdDuration;
    case "exhale":
      return exhaleDuration;
    default:
      return 1000;
  }
};

export const calculateCircleScale = (
  phase: BreathingPhase,
  progress: number,
  secondsLeft: number | undefined,
  maxSeconds: number
): number => {
  // Base scale is 50%
  const baseScale = 0.5;
  
  if (secondsLeft !== undefined && maxSeconds > 0) {
    const percentComplete = (maxSeconds - secondsLeft) / maxSeconds;
    
    if (phase === "inhale") {
      // Expand from 50% to 100% during inhale
      return baseScale + (percentComplete * 0.5);
    } else if (phase === "hold") {
      // Stay at 100% during hold
      return 1.0;
    } else if (phase === "exhale") {
      // Shrink from 100% back to 50% during exhale
      return 1.0 - (percentComplete * 0.5);
    } else {
      // Rest at 50%
      return baseScale;
    }
  } else {
    if (phase === "inhale") {
      // Expand from 50% to 100% during inhale
      return baseScale + (progress / 100) * 0.5;
    } else if (phase === "hold") {
      // Stay at 100% during hold
      return 1.0;
    } else if (phase === "exhale") {
      // Shrink from 100% back to 50% during exhale
      return 1.0 - (progress / 100) * 0.5;
    } else {
      // Rest at 50%
      return baseScale;
    }
  }
};

export const getPhaseLabel = (phase: BreathingPhase): string => {
  switch (phase) {
    case "inhale": 
      return "Adem in";
    case "hold": 
      return "Houd vast";
    case "exhale": 
      return "Adem uit";
    case "rest":
    default:
      return "Klaar";
  }
};
