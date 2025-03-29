
/**
 * Phase Management Utilities
 * Functions for managing breathing phases and transitions
 */

import { BreathingPhase } from '../types';

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
 * Maps a phase to its next phase based on the breathing pattern
 * @param phase - Current phase
 * @param skipHold - Whether to skip the hold phase
 * @returns Next phase in the sequence
 */
export const mapPhaseToNextPhase = (
  phase: BreathingPhase,
  skipHold: boolean = false
): BreathingPhase => {
  const phaseMap: Record<BreathingPhase, BreathingPhase> = {
    'start': 'inhale',
    'inhale': skipHold ? 'exhale' : 'hold',
    'hold': 'exhale',
    'exhale': 'pause',
    'pause': 'inhale',
    'end': 'start'
  };
  
  return phaseMap[phase] || 'inhale';
};
