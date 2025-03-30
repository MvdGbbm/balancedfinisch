
import { BreathingPhase } from "./types";

/**
 * Get the appropriate transition duration based on the current phase
 */
export const getTransitionDuration = (
  phase: BreathingPhase,
  inhaleDuration: number,
  holdDuration: number,
  exhaleDuration: number
): number => {
  switch (phase) {
    case "inhale":
      return inhaleDuration * 1000;
    case "hold":
      return holdDuration * 1000;
    case "exhale":
      return exhaleDuration * 1000;
    case "pause":
    case "rest":
    case "start":
    default:
      return 1000;
  }
};

/**
 * Calculate the circle scale based on the current phase and progress
 */
export const calculateCircleScale = (
  phase: BreathingPhase,
  progress: number,
  secondsLeft: number | undefined,
  maxSeconds: number
): number => {
  // Base scale is 50%
  const baseScale = 0.5;
  const maxScale = 1.0;
  
  if (secondsLeft !== undefined && maxSeconds > 0) {
    const percentComplete = (maxSeconds - secondsLeft) / maxSeconds;
    
    switch (phase) {
      case "inhale":
        // Expand from 50% to 100% during inhale
        return baseScale + (percentComplete * 0.5);
      case "hold":
        // Stay at 100% during hold
        return maxScale;
      case "exhale":
        // Shrink from 100% back to 50% during exhale
        return maxScale - (percentComplete * 0.5);
      case "pause":
      case "rest":
      case "start":
      default:
        // Rest at 50%
        return baseScale;
    }
  } else {
    switch (phase) {
      case "inhale":
        // Expand from 50% to 100% during inhale
        return baseScale + (progress / 100) * 0.5;
      case "hold":
        // Stay at 100% during hold
        return maxScale;
      case "exhale":
        // Shrink from 100% back to 50% during exhale
        return maxScale - (progress / 100) * 0.5;
      case "pause":
      case "rest":
      case "start":
      default:
        // Rest at 50%
        return baseScale;
    }
  }
};

/**
 * Get the label for the current breathing phase
 */
export const getPhaseLabel = (phase: BreathingPhase, customLabels?: Record<BreathingPhase, string>): string => {
  if (customLabels && customLabels[phase]) {
    return customLabels[phase];
  }
  
  switch (phase) {
    case "inhale": 
      return "Adem in";
    case "hold": 
      return "Houd vast";
    case "exhale": 
      return "Adem uit";
    case "pause":
      return "Pauze";
    case "start":
      return "Start";
    case "rest":
    default:
      return "Klaar";
  }
};

/**
 * Get the next phase in the breathing cycle
 */
export const getNextPhase = (currentPhase: BreathingPhase, skipHold: boolean = false): BreathingPhase => {
  switch (currentPhase) {
    case "start":
      return "inhale";
    case "inhale":
      return skipHold ? "exhale" : "hold";
    case "hold":
      return "exhale";
    case "exhale":
      return "pause";
    case "pause":
      return "inhale";
    case "rest":
    default:
      return "start";
  }
};

/**
 * Check if we should skip a phase based on its duration
 */
export const shouldSkipPhase = (phase: BreathingPhase, settings: { holdDuration?: number; pauseDuration?: number }): boolean => {
  if (phase === "hold" && (!settings.holdDuration || settings.holdDuration <= 0)) {
    return true;
  }
  
  if (phase === "pause" && (!settings.pauseDuration || settings.pauseDuration <= 0)) {
    return true;
  }
  
  return false;
};

/**
 * Get the duration for a specific phase in seconds
 */
export const getPhaseDuration = (
  phase: BreathingPhase,
  settings: {
    inhaleDuration: number;
    holdDuration: number;
    exhaleDuration: number;
    pauseDuration: number;
  }
): number => {
  switch (phase) {
    case "inhale":
      return settings.inhaleDuration;
    case "hold":
      return settings.holdDuration;
    case "exhale":
      return settings.exhaleDuration;
    case "pause":
      return settings.pauseDuration;
    case "start":
    case "rest":
    default:
      return 3; // Default start/rest duration
  }
};
