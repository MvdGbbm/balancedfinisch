
/**
 * Animation and Visual Utilities
 * Functions for managing breathing circle visuals without animations
 */

import { BreathingPhase } from '../types';

/**
 * Gets the circle static class based on the current phase
 * @param phase - The current breathing phase
 * @param exerciseCompleted - Whether the exercise is completed
 * @returns The CSS class for the circle
 */
export const getCircleAnimationClass = (
  phase: BreathingPhase, 
  exerciseCompleted: boolean
): string => {
  if (exerciseCompleted) {
    return 'scale-100'; // Reset to default scale when exercise is completed
  }
  
  switch (phase) {
    case 'start':
      return 'scale-100'; // No animation for start phase
    case 'inhale':
      return 'scale-100';
    case 'hold':
      return 'scale-100';
    case 'exhale':
      return 'scale-100';
    default:
      return 'scale-100';
  }
};

/**
 * Gets an appropriate scale value for a breathing circle based on the phase
 * @param phase - Current breathing phase
 * @returns Scale value (1.0 for all phases)
 */
export const getCircleScale = (
  phase: BreathingPhase
): number => {
  return 1.0;
};

/**
 * Gets a CSS transition duration string for animations
 * @param phaseTime - The duration of the phase in seconds
 * @returns CSS transition duration string (now always 0)
 */
export const getTransitionDuration = (phaseTime: number): string => {
  return '0s';
};

/**
 * Determines if a phase should show a counter
 * @param phase - The breathing phase
 * @param exerciseCompleted - Whether the exercise is completed
 * @returns Boolean indicating if counter should be shown
 */
export const shouldShowCounter = (
  phase: BreathingPhase, 
  exerciseCompleted: boolean
): boolean => {
  return (phase !== 'start') && !exerciseCompleted;
};
