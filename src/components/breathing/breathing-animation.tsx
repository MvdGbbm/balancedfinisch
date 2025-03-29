
import React from 'react';
import { BreathingCircle } from './breathing-circle';
import { BreathingPhase } from './types';
import { BreathingPhaseDisplay } from '../breathing-circle/breathing-phase-display';
import { AudioElement } from './audio/audio-element';
import { useBreathingAudio } from './audio/use-breathing-audio';

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
  const { audioRef } = useBreathingAudio({
    voiceUrls,
    isVoiceActive,
    phase,
    isActive
  });

  return (
    <div className="relative flex flex-col items-center justify-center">
      <BreathingCircle
        phase={phase}
        isActive={isActive}
        inhaleDuration={inhaleDuration}
        holdDuration={holdDuration} 
        exhaleDuration={exhaleDuration}
      />
      
      {showPhaseText && (
        <div className="absolute">
          <BreathingPhaseDisplay 
            breathingPhase={phase} 
            secondsLeft={secondsLeft} 
          />
        </div>
      )}
      
      <AudioElement audioRef={audioRef} />
    </div>
  );
};
