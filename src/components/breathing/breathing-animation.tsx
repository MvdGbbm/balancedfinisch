
import React from 'react';
import { BreathingCircle } from './breathing-circle';
import { BreathingPhaseDisplay } from '../breathing-circle/breathing-phase-display';
import { BreathingAudio } from './audio/breathing-audio';

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
            activePhase={phase} 
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
