
import React, { useRef, useEffect } from 'react';
import { BreathingPhase } from '../types';
import { useAudioValidation, VoiceUrls } from './use-audio-validation';
import { useAudioPlayback } from './use-audio-playback';

interface UseBreathingAudioProps {
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

export const useBreathingAudio = ({
  voiceUrls,
  isVoiceActive,
  phase,
  isActive
}: UseBreathingAudioProps) => {
  const previousPhaseRef = useRef<BreathingPhase | null>(null);
  const { validateVoiceUrls } = useAudioValidation();
  const { audioRef, playAudio } = useAudioPlayback({ voiceUrls, isVoiceActive });

  // Effect to play audio when phase changes
  useEffect(() => {
    if (previousPhaseRef.current !== phase) {
      console.log(`Phase changed from ${previousPhaseRef.current} to ${phase}`);
      if (phase !== 'pause' && isVoiceActive && voiceUrls) {
        // If it's the hold phase and there's no URL for it, just skip
        if (phase === 'hold' && (!voiceUrls.hold || voiceUrls.hold.trim() === '')) {
          console.log('Skipping hold audio because no URL is provided');
        } else {
          playAudio(phase);
        }
      }
      previousPhaseRef.current = phase;
    }
  }, [phase, voiceUrls, isVoiceActive, isActive, playAudio]);

  // Effect to initialize audio and handle voice activation
  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('error', (e) => {
        console.error("Audio element error:", e);
      });
    }
    
    if (!isVoiceActive && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else if (isVoiceActive && voiceUrls && audioRef.current && isActive) {
      // Don't try to play audio for hold phase if no URL exists
      if (phase === 'hold' && (!voiceUrls.hold || voiceUrls.hold.trim() === '')) {
        console.log('Skipping initial hold audio because no URL is provided');
      } else {
        playAudio(phase);
      }
    }
  }, [isVoiceActive, voiceUrls, isActive, phase, playAudio]);

  // Effect to validate URLs when they change
  useEffect(() => {
    if (voiceUrls && isVoiceActive) {
      validateVoiceUrls(voiceUrls);
    }
    
    // Clean up function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [voiceUrls, isVoiceActive, validateVoiceUrls]);

  return {
    audioRef,
    playAudio
  };
};
