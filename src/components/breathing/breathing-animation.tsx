
import React from 'react';
import { BreathingCircle } from './breathing-circle';
import { BreathingPhase } from './types';
import { BreathingPhaseDisplay } from './breathing-phase-display';
import { BreathingAudio } from './audio/breathing-audio';

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
  return (
    <div className="relative flex flex-col items-center justify-center">
      <BreathingCircle
        isActive={isActive}
        phase={phase}
        inhaleDuration={inhaleDuration}
        holdDuration={holdDuration} 
        exhaleDuration={exhaleDuration}
      />
      
      {showPhaseText && (
        <div className="absolute">
          <BreathingPhaseDisplay 
            phase={phase} 
            secondsLeft={secondsLeft} 
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
