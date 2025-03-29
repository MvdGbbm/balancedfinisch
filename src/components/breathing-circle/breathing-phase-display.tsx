
import React from 'react';
import { BreathingPhase } from '@/components/breathing/types';

export interface BreathingPhaseDisplayProps {
  phase: BreathingPhase;
  timeLeft: number;
}

export const BreathingPhaseDisplay: React.FC<BreathingPhaseDisplayProps> = ({
  phase,
  timeLeft
}) => {
  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Inademen';
      case 'hold':
        return 'Vasthouden';
      case 'exhale':
        return 'Uitademen';
      case 'pause':
        return 'Pauze';
      case 'start':
        return 'Start';
      case 'end':
        return 'Einde';
      default:
        return '';
    }
  };

  return (
    <div className="text-center">
      <div className="text-xl font-semibold">{getPhaseText()}</div>
      {timeLeft > 0 && <div className="text-sm">{timeLeft}s</div>}
    </div>
  );
};
