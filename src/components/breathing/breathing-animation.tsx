
import React from 'react';
import BreathingCircle from './breathing-circle';
import { BreathingPhaseDisplay } from '../breathing-circle/breathing-phase-display';
import { BreathingAudio } from './audio/breathing-audio';
import { BreathingPhase } from './types';

// Define the props interface
interface BreathingAnimationProps {
  isActive: boolean;
  phase: BreathingPhase;
  secondsLeft: number;
  inhaleDuration: number;
  holdDuration: number;
  exhaleDuration: number;
  voiceUrls: {
    start?: string;
    inhale: string;
    hold: string;
    exhale: string;
    end?: string;
  } | null;
  isVoiceActive: boolean;
  showPhaseText?: boolean;
}

export const BreathingAnimation: React.FC<BreathingAnimationProps> = ({
  isActive,
  phase,
  secondsLeft,
  inhaleDuration,
  holdDuration,
  exhaleDuration,
  voiceUrls,
  isVoiceActive,
  showPhaseText = true
}) => {
  // Map breathing phase to circle phase
  const mapPhaseToCirclePhase = (breathingPhase: BreathingPhase) => {
    switch (breathingPhase) {
      case 'inhale': return 'inhale';
      case 'hold': return 'hold';
      case 'exhale': return 'exhale';
      case 'start': 
      case 'pause':
      default: return 'rest';
    }
  };

  const circlePhase = mapPhaseToCirclePhase(phase);
  
  return (
    <div className="relative flex flex-col items-center justify-center">
      <BreathingCircle
        isActive={isActive}
        phase={phase}
        inhaleDuration={inhaleDuration}
        holdDuration={holdDuration} 
        exhaleDuration={exhaleDuration}
        count={secondsLeft}
        exerciseCompleted={false}
        currentCycle={1}
        totalCycles={1}
        animationDuration={1}
        onToggleActive={() => {}}
      />
      
      {showPhaseText && (
        <div className="absolute">
          <BreathingPhaseDisplay 
            activePhase={circlePhase} 
            phaseTimeLeft={secondsLeft} 
          />
        </div>
      )}
      
      <BreathingAudio 
        voiceUrls={voiceUrls}
        isVoiceActive={isVoiceActive}
        phase={phase}
        isActive={isActive}
      />
    </div>
  );
};

// Adding default export to fix any potential issues with imports
export default BreathingAnimation;
