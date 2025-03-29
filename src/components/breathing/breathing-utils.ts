
import { BreathingPhase } from './types';

/**
 * Determines the next phase in the breathing cycle
 * @param currentPhase - The current breathing phase
 * @param holdTime - Duration of hold phase in seconds (0 means skip the hold phase)
 * @returns The next breathing phase
 */
export const getNextPhase = (currentPhase: BreathingPhase, holdTime: number = 0): BreathingPhase => {
  switch (currentPhase) {
    case 'start':
      return 'inhale';
    case 'inhale':
      return holdTime > 0 ? 'hold' : 'exhale';
    case 'hold':
      return 'exhale';
    case 'exhale':
      return 'pause';
    case 'pause':
      return 'inhale';
    default:
      return 'inhale';
  }
};

/**
 * Gets the count duration for a specific breathing phase
 * @param currentPhase - The breathing phase to get the count for
 * @param inhaleTime - Duration of inhale phase in seconds
 * @param holdTime - Duration of hold phase in seconds
 * @param exhaleTime - Duration of exhale phase in seconds
 * @param pauseTime - Duration of pause phase in seconds
 * @returns The count duration in seconds
 */
export const getCountForPhase = (
  currentPhase: BreathingPhase,
  inhaleTime: number,
  holdTime: number,
  exhaleTime: number,
  pauseTime: number
): number => {
  switch (currentPhase) {
    case 'start':
      return 3; // Default 3 second countdown for start phase
    case 'inhale':
      return inhaleTime;
    case 'hold':
      return holdTime;
    case 'exhale':
      return exhaleTime;
    case 'pause':
      return pauseTime;
    default:
      return inhaleTime;
  }
};

/**
 * Gets the display message for a breathing phase
 * @param phase - The breathing phase
 * @returns The message to display for the phase
 */
export const getBreathingMessage = (phase: BreathingPhase): string => {
  switch (phase) {
    case 'start':
      return 'Start';
    case 'inhale':
      return 'Adem in';
    case 'hold':
      return 'Houd vast';
    case 'exhale':
      return 'Adem uit';
    case 'pause':
      return '';
    default:
      return 'Adem in';
  }
};

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
 * Calculates the total duration of a complete breath cycle
 * @param inhaleTime - Duration of inhale phase in seconds
 * @param holdTime - Duration of hold phase in seconds
 * @param exhaleTime - Duration of exhale phase in seconds
 * @param pauseTime - Duration of pause phase in seconds
 * @returns The total cycle duration in seconds
 */
export const getTotalCycleDuration = (
  inhaleTime: number,
  holdTime: number,
  exhaleTime: number,
  pauseTime: number
): number => {
  return inhaleTime + holdTime + exhaleTime + pauseTime;
};

/**
 * Formats a seconds value into a MM:SS string
 * @param seconds - The seconds to format
 * @returns Formatted time string
 */
export const formatTimeFromSeconds = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculates the total exercise duration
 * @param cycles - Number of breathing cycles
 * @param inhaleTime - Duration of inhale phase in seconds
 * @param holdTime - Duration of hold phase in seconds
 * @param exhaleTime - Duration of exhale phase in seconds
 * @param pauseTime - Duration of pause phase in seconds
 * @returns The total exercise duration in seconds
 */
export const calculateExerciseDuration = (
  cycles: number,
  inhaleTime: number,
  holdTime: number,
  exhaleTime: number,
  pauseTime: number
): number => {
  const cycleDuration = getTotalCycleDuration(inhaleTime, holdTime, exhaleTime, pauseTime);
  // Add start phase duration (3 seconds)
  return cycles * cycleDuration + 3;
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

/**
 * Creates a human-readable description of the breathing pattern
 * @param inhaleTime - Duration of inhale phase in seconds
 * @param holdTime - Duration of hold phase in seconds
 * @param exhaleTime - Duration of exhale phase in seconds
 * @param pauseTime - Duration of pause phase in seconds
 * @returns Description string of the pattern
 */
export const createPatternDescription = (
  inhaleTime: number,
  holdTime: number,
  exhaleTime: number,
  pauseTime: number
): string => {
  let parts = [];
  parts.push(`Inademen: ${inhaleTime}s`);
  
  if (holdTime > 0) {
    parts.push(`Vasthouden: ${holdTime}s`);
  }
  
  parts.push(`Uitademen: ${exhaleTime}s`);
  
  if (pauseTime > 0) {
    parts.push(`Pauze: ${pauseTime}s`);
  }
  
  return parts.join(' • ');
};
