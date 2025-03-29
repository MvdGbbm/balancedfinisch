
import React from 'react';
import { BreathingPhase } from '../types';
import { useBreathingAudio } from './use-breathing-audio';
import { AudioElement } from './audio-element';

interface BreathingAudioProps {
  voiceUrls: {
    start?: string;
    inhale: string;
    hold: string;
    exhale: string;
    end?: string;
  } | null;
  isVoiceActive: boolean;
  phase: BreathingPhase;
  isActive: boolean;
}

export const BreathingAudio: React.FC<BreathingAudioProps> = (props) => {
  const { audioRef } = useBreathingAudio(props);

  return <AudioElement audioRef={audioRef} />;
};

export default BreathingAudio;
