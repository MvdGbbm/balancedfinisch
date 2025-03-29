
import React from 'react';
import BreathingCircle from './breathing-circle';
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

  // Map the BreathingPhase to the format expected by BreathingCircle
  const mapPhaseToCirclePhase = (breathingPhase: BreathingPhase): 'inhale' | 'hold' | 'exhale' | 'pause' => {
    switch (breathingPhase) {
      case 'inhale': return 'inhale';
      case 'hold': return 'hold';
      case 'exhale': return 'exhale';
      default: return 'pause';
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <BreathingCircle
        phase={mapPhaseToCirclePhase(phase)}
        inhaleDuration={inhaleDuration}
        holdDuration={holdDuration} 
        exhaleDuration={exhaleDuration}
      />
      
      {showPhaseText && (
        <div className="absolute">
          <BreathingPhaseDisplay 
            phase={phase} 
            timeLeft={secondsLeft} 
          />
        </div>
      )}
      
      <AudioElement audioRef={audioRef} />
    </div>
  );
};
