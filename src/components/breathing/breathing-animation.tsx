
import React, { useEffect } from 'react';
import BreathingCircle from '../breathing-circle/breathing-circle';
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
  // Debug current state
  useEffect(() => {
    if (isActive) {
      console.log(`Animation active: Phase ${phase}, Seconds left: ${secondsLeft}`);
      console.log(`Durations - Inhale: ${inhaleDuration}ms, Hold: ${holdDuration}ms, Exhale: ${exhaleDuration}ms`);
    }
  }, [isActive, phase, secondsLeft, inhaleDuration, holdDuration, exhaleDuration]);

  // Map breathing phase to circle phase
  const mapPhaseToCirclePhase = (breathingPhase: BreathingPhase): "inhale" | "hold" | "exhale" | "rest" => {
    switch (breathingPhase) {
      case 'inhale': return 'inhale';
      case 'hold': return 'hold';
      case 'exhale': return 'exhale';
      case 'hold1': return 'hold';
      case 'hold2': return 'hold';
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
        currentPhase={circlePhase}
        inhaleDuration={inhaleDuration}
        holdDuration={holdDuration} 
        exhaleDuration={exhaleDuration}
        secondsLeft={secondsLeft}
        holdEnabled={holdDuration > 0}
        onBreathComplete={() => {
          console.log("Breath completed");
        }}
        className="text-primary"
      />
      
      {isVoiceActive && voiceUrls && (
        <BreathingAudio 
          voiceUrls={voiceUrls}
          isVoiceActive={isVoiceActive}
          phase={phase}
          isActive={isActive}
        />
      )}
    </div>
  );
};

// Adding default export to fix any potential issues with imports
export default BreathingAnimation;
