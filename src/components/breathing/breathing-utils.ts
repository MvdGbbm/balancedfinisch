
import { BreathingPhase } from './types';

export const getNextPhase = (currentPhase: BreathingPhase): BreathingPhase => {
  switch (currentPhase) {
    case 'start':
      return 'inhale';
    case 'inhale':
      return 'hold';
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

export const getCountForPhase = (
  currentPhase: BreathingPhase,
  inhaleTime: number,
  holdTime: number,
  exhaleTime: number,
  pauseTime: number
): number => {
  switch (currentPhase) {
    case 'start':
      return 0; // No countdown for start phase
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
