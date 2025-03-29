
/**
 * Animation and Visual Utilities
 * Functions for managing breathing circle animations and visual effects
 */

import { BreathingPhase } from '../types';

/**
 * Gets the circle animation class based on the current phase
 * @param phase - The current breathing phase
 * @param exerciseCompleted - Whether the exercise is completed
 * @returns The CSS class for the animation
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
      return 'scale-125';
    case 'hold':
      return 'scale-125';
    case 'exhale':
      return 'scale-100';
    default:
      return 'scale-100';
  }
};

/**
 * Gets an appropriate scale value for a breathing circle based on the phase
 * @param phase - Current breathing phase
 * @returns Scale value (between 0.75 and 1.25)
 */
export const getCircleScale = (
  phase: BreathingPhase
): number => {
  const baseScale = 0.85;
  const maxScale = 1.25;
  const minScale = 0.75;
  
  switch (phase) {
    case 'inhale':
      return maxScale;
    case 'hold':
      return maxScale;
    case 'exhale':
      return minScale;
    case 'start':
    case 'end':
    default:
      return baseScale;
  }
};

/**
 * Gets a CSS transition duration string for animations
 * @param phaseTime - The duration of the phase in seconds
 * @returns CSS transition duration string
 */
export const getTransitionDuration = (phaseTime: number): string => {
  return `${0.5}s`;
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
