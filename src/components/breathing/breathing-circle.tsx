
import React from 'react';
import { BreathingPhase } from './types';
import { getBreathingMessage } from './breathing-utils';

interface BreathingCircleProps {
  phase: BreathingPhase;
  count: number;
  exerciseCompleted: boolean;
  currentCycle: number;
  totalCycles: number;
  animationDuration: number;
  onToggleActive: () => void;
}

const BreathingCircle: React.FC<BreathingCircleProps> = ({
  phase,
  count,
  exerciseCompleted,
  currentCycle,
  totalCycles,
  animationDuration,
  onToggleActive
}) => {
  const circleClass = () => {
    if (exerciseCompleted) {
      return 'scale-100'; // Reset to default scale when exercise is completed
    }
    
    switch (phase) {
      case 'inhale':
        return `grow-animation`;
      case 'hold':
        return 'scale-125';
      case 'exhale':
        return `shrink-animation`;
      case 'pause':
        return 'scale-100';
      default:
        return 'scale-100';
    }
  };

  const animationStyle = () => {
    return {
      animationDuration: `${animationDuration}s`
    };
  };

  const shouldShowCounter = phase !== 'pause' && !exerciseCompleted;
  const circleSize = 'w-48 h-48';
  const innerCircleSize = 'w-40 h-40';

  return (
    <div className="breathe-animation-container h-[450px] flex flex-col items-center justify-center my-0 rounded-lg">
      <div 
        className={`breathe-circle ${circleSize} ${circleClass()}`} 
        style={animationStyle()} 
        onClick={onToggleActive}
      >
        <div className={`breathe-inner-circle ${innerCircleSize}`}>
          <div className="flex flex-col items-center justify-center text-center">
            {!exerciseCompleted ? (
              <>
                <p className="text-xl font-light mb-2">{getBreathingMessage(phase)}</p>
                {shouldShowCounter && <p className="text-3xl font-medium">{count}</p>}
              </>
            ) : (
              <p className="text-xl font-light">Voltooid</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-white/70 my-0 py-[11px]">
          Cyclus {currentCycle} van {totalCycles}
        </p>
      </div>
    </div>
  );
};

export default BreathingCircle;
