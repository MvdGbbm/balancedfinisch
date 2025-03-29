
/**
 * Time and Cycle Calculation Utilities
 * Functions for calculating durations, formatting times, and tracking cycles
 */

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
 * Calculates the progress percentage through the current cycle
 * @param currentCycle - Current cycle number
 * @param totalCycles - Total number of cycles in the exercise
 * @returns Progress percentage (0-100)
 */
export const calculateCycleProgress = (
  currentCycle: number,
  totalCycles: number
): number => {
  return Math.min(((currentCycle - 1) / totalCycles) * 100, 100);
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
 * Generates a user-friendly text for the remaining time
 * @param seconds - Seconds remaining
 * @returns Formatted remaining time text
 */
export const formatRemainingTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} ${seconds === 1 ? 'seconde' : 'seconden'}`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes} ${minutes === 1 ? 'minuut' : 'minuten'}`;
  }
  
  return `${minutes} ${minutes === 1 ? 'minuut' : 'minuten'} en ${remainingSeconds} ${remainingSeconds === 1 ? 'seconde' : 'seconden'}`;
};
