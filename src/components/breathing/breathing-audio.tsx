
import React, { useRef, useEffect } from 'react';
import { BreathingPhase } from './types';
import { toast } from 'sonner';
import { preloadAudio } from '@/components/audio-player/utils';
import { shouldPlayAudioForPhase } from './breathing-utils';

interface BreathingAudioProps {
  voiceUrls: {
    start?: string;
    inhale: string;
    hold: string;
    exhale: string;
  } | null;
  isVoiceActive: boolean;
  phase: BreathingPhase;
  isActive: boolean;
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
  pauseTime: number;
}

export const useBreathingAudio = ({
  voiceUrls,
  isVoiceActive,
  phase,
  isActive,
  inhaleTime,
  holdTime,
  exhaleTime,
  pauseTime
}: BreathingAudioProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousPhaseRef = useRef<BreathingPhase | null>(null);
  const audioErrorCountRef = useRef<number>(0);
  const audioLoadingRef = useRef<boolean>(false);

  const validateVoiceUrls = async (urls: {
    start?: string;
    inhale: string;
    hold: string;
    exhale: string;
  }) => {
    if (!urls.inhale || !urls.hold || !urls.exhale) {
      console.log("Voice URLs are incomplete, skipping validation");
      return false;
    }
    try {
      const urlsToValidate = [urls.inhale, urls.exhale];
      
      // Only validate hold URL if hold time is > 0
      if (holdTime > 0 && urls.hold) {
        urlsToValidate.push(urls.hold);
      }
      
      if (urls.start) {
        urlsToValidate.push(urls.start);
      }
      
      const validationPromises = urlsToValidate.map(url => preloadAudio(url));
      const validationResults = await Promise.all(validationPromises);
      
      const allValid = validationResults.every(result => result === true);
      
      if (!allValid) {
        console.error("One or more voice audio URLs failed validation");
        audioErrorCountRef.current = 5;
        toast.error("Fout bij het laden van audio. Controleer of alle URL's correct zijn.");
        return false;
      }
      console.log("All voice URLs validated successfully");
      return true;
    } catch (error) {
      console.error("Error validating voice URLs:", error);
      return false;
    }
  };

  const playAudio = async (phaseType: BreathingPhase) => {
    if (!voiceUrls || !isVoiceActive || !audioRef.current || audioLoadingRef.current) return;
    
    // Skip playing audio if the corresponding phase time is zero
    if (!shouldPlayAudioForPhase(phaseType, inhaleTime, holdTime, exhaleTime, pauseTime)) {
      console.log(`Skipping audio for ${phaseType} because duration is zero`);
      return;
    }
    
    let audioUrl = '';
    switch (phaseType) {
      case 'start':
        audioUrl = voiceUrls.start || '';
        break;
      case 'inhale':
        audioUrl = voiceUrls.inhale;
        break;
      case 'hold':
        // Skip if hold time is zero
        if (holdTime <= 0) {
          console.log(`Hold time is ${holdTime}, skipping hold audio`);
          return;
        }
        audioUrl = voiceUrls.hold;
        break;
      case 'exhale':
        audioUrl = voiceUrls.exhale;
        break;
      default:
        audioUrl = '';
    }
    
    if (!audioUrl) {
      console.log(`No audio URL for ${phaseType} phase`);
      return;
    }
    
    audioLoadingRef.current = true;
    try {
      console.log(`Attempting to play ${phaseType} audio: ${audioUrl}`);
      const isValid = await preloadAudio(audioUrl);
      if (!isValid) {
        throw new Error(`Failed to preload ${phaseType} audio`);
      }
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.volume = 1.0;
        try {
          await audioRef.current.play();
          console.log(`Playing ${phaseType} audio successfully`);
          audioErrorCountRef.current = 0;
        } catch (playError) {
          console.error(`Error playing ${phaseType} audio:`, playError);
          if (audioErrorCountRef.current < 5) {
            audioErrorCountRef.current++;
            if (audioErrorCountRef.current === 3) {
              toast.error("Fout bij afspelen van audio. Controleer de URL's.");
            }
          }
          if (playError.name === 'NotAllowedError') {
            console.log("Audio playback requires user interaction");
          }
        }
      }
    } catch (error) {
      console.error(`Error with ${phaseType} audio:`, error);
      audioErrorCountRef.current++;
      if (audioErrorCountRef.current === 3) {
        toast.error("Fout bij het afspelen van audio. Controleer of alle URL's correct zijn.");
      }
    } finally {
      audioLoadingRef.current = false;
    }
  };

  useEffect(() => {
    if (previousPhaseRef.current !== phase) {
      console.log(`Phase changed from ${previousPhaseRef.current} to ${phase}`);
      if (phase !== 'pause' && isVoiceActive && voiceUrls) {
        playAudio(phase);
      }
      previousPhaseRef.current = phase;
    }
  }, [phase, voiceUrls, isVoiceActive, isActive]);

  useEffect(() => {
    if (!isVoiceActive && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else if (isVoiceActive && voiceUrls && audioRef.current && isActive) {
      playAudio(phase);
    }
  }, [isVoiceActive, voiceUrls, isActive, phase]);

  useEffect(() => {
    if (voiceUrls && isVoiceActive) {
      validateVoiceUrls(voiceUrls);
    }
  }, [voiceUrls, isVoiceActive]);

  return {
    audioRef,
    playAudio
  };
};

const BreathingAudio: React.FC<BreathingAudioProps> = (props) => {
  const { audioRef } = useBreathingAudio(props);

  return (
    <audio ref={audioRef} onError={() => {
      console.error("Audio element error");
    }} />
  );
};

export default BreathingAudio;
