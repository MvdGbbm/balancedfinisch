
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
      return 'grow-animation';
    case 'hold':
      return 'scale-125';
    case 'exhale':
      return 'shrink-animation';
    case 'pause':
      return 'scale-100';
    default:
      return 'scale-100';
  }
};

/**
 * Gets an appropriate scale value for a breathing circle based on the phase
 * @param phase - Current breathing phase
 * @param progress - Current progress through the phase (0-100)
 * @returns Scale value (between 0.5 and 1.25)
 */
export const getCircleScale = (
  phase: BreathingPhase,
  progress: number = 0
): number => {
  const baseScale = 0.85;
  const maxScale = 1.25;
  const minScale = 0.5;
  
  switch (phase) {
    case 'inhale':
      // Scale from base to max during inhale
      return baseScale + ((maxScale - baseScale) * (progress / 100));
    case 'hold':
      // Stay at max scale during hold
      return maxScale;
    case 'exhale':
      // Scale from max to min during exhale
      return maxScale - ((maxScale - minScale) * (progress / 100));
    case 'pause':
      // Stay at min scale during pause
      return minScale;
    case 'start':
    case 'end':
    default:
      // Default scale for other phases
      return baseScale;
  }
};

/**
 * Gets a CSS transition duration string for animations
 * @param phaseTime - The duration of the phase in seconds
 * @returns CSS transition duration string
 */
export const getTransitionDuration = (phaseTime: number): string => {
  return `${phaseTime}s`;
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
  return (phase !== 'pause' && phase !== 'start') && !exerciseCompleted;
};
