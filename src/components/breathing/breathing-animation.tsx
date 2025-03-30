
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { BreathingPhase, BreathingTechnique, BreathingAnimationProps } from './types';
import { getCountForPhase, getNextPhase } from './breathing-utils';
import BreathingAudio from './breathing-audio';
import BreathingCircle from './breathing-circle';

const BreathingAnimation: React.FC<BreathingAnimationProps> = ({
  technique,
  voiceUrls,
  isVoiceActive,
  currentPhase: externalPhase,
  onPhaseChange,
  currentCycle = 1,
  totalCycles = 5,
  exerciseCompleted = false,
  inhaleTime,
  holdTime,
  exhaleTime,
  pauseTime
}) => {
  const [internalPhase, setInternalPhase] = useState<BreathingPhase>('start');
  const [count, setCount] = useState(getCountForPhase('start', inhaleTime, holdTime, exhaleTime, pauseTime));
  const [isActive, setIsActive] = useState(true);
  const isMobile = useIsMobile();
  
  const phase = externalPhase || internalPhase;

  useEffect(() => {
    if (!externalPhase) {
      setInternalPhase('start');
    }
    setCount(getCountForPhase(externalPhase || 'start', inhaleTime, holdTime, exhaleTime, pauseTime));
    setIsActive(true);
  }, [technique, externalPhase, inhaleTime, holdTime, exhaleTime, pauseTime]);

  useEffect(() => {
    if (!isActive || exerciseCompleted) return;
    
    const interval = setInterval(() => {
      setCount(prevCount => {
        if (prevCount <= 1) {
          // Get next phase based on current phase and durations
          const nextPhase = getNextPhase(phase, holdTime, pauseTime);
          
          if (!externalPhase) {
            setInternalPhase(nextPhase);
          } else if (onPhaseChange) {
            onPhaseChange(nextPhase);
          }
          
          return getCountForPhase(nextPhase, inhaleTime, holdTime, exhaleTime, pauseTime);
        }
        return prevCount - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [phase, isActive, externalPhase, onPhaseChange, exerciseCompleted, inhaleTime, holdTime, exhaleTime, pauseTime]);

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  // Skip hold/pause phases in the audio playback if their duration is 0
  const shouldSkipHoldAudio = holdTime <= 0;
  const shouldSkipPauseAudio = pauseTime <= 0;

  return (
    <>
      <BreathingAudio 
        voiceUrls={voiceUrls}
        isVoiceActive={isVoiceActive}
        phase={phase}
        isActive={isActive}
        skipHoldAudio={shouldSkipHoldAudio}
        skipPauseAudio={shouldSkipPauseAudio}
      />
      
      <BreathingCircle
        phase={phase}
        count={count}
        exerciseCompleted={exerciseCompleted}
        currentCycle={currentCycle}
        totalCycles={totalCycles}
        animationDuration={getCountForPhase(phase, inhaleTime, holdTime, exhaleTime, pauseTime)}
        onToggleActive={toggleActive}
      />
    </>
  );
};

export default BreathingAnimation;
