
import { BreathingPhase } from './types';

export const getNextPhase = (
  currentPhase: BreathingPhase,
  holdTime: number = 0,
  pauseTime: number = 0
): BreathingPhase => {
  switch (currentPhase) {
    case 'start':
      return 'inhale';
    case 'inhale':
      // Skip hold phase if holdTime is 0
      return holdTime > 0 ? 'hold' : 'exhale';
    case 'hold':
      return 'exhale';
    case 'exhale':
      // Skip pause phase if pauseTime is 0
      return pauseTime > 0 ? 'pause' : 'inhale';
    case 'pause':
      return 'inhale';
    default:
      return 'inhale';
  }
};

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

export const getBreathingMessage = (
  phase: BreathingPhase,
  holdTime: number = 0,
  pauseTime: number = 0
): string => {
  switch (phase) {
    case 'start':
      return 'Start';
    case 'inhale':
      return 'Adem in';
    case 'hold':
      return holdTime > 0 ? 'Houd vast' : '';
    case 'exhale':
      return 'Adem uit';
    case 'pause':
      return pauseTime > 0 ? 'Pauze' : '';
    default:
      return 'Adem in';
  }
};
