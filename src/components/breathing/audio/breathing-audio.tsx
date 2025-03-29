
import React, { useEffect } from 'react';
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

  // Debug voice functionality
  useEffect(() => {
    if (props.isVoiceActive && props.voiceUrls) {
      console.log("Voice active with URLs:", props.voiceUrls);
    }
  }, [props.isVoiceActive, props.voiceUrls]);

  return <AudioElement audioRef={audioRef} />;
};

export default BreathingAudio;
