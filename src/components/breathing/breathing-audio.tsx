
import React, { useRef, useEffect, useState } from 'react';
import { BreathingPhase } from './types';
import { toast } from 'sonner';
import { preloadAudio } from '@/components/audio-player/utils';

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
  skipHoldAudio?: boolean;
}

export const useBreathingAudio = ({
  voiceUrls,
  isVoiceActive,
  phase,
  isActive,
  skipHoldAudio = false
}: BreathingAudioProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousPhaseRef = useRef<BreathingPhase | null>(null);
  const audioErrorCountRef = useRef<number>(0);
  const audioLoadingRef = useRef<boolean>(false);
  const [audioPlayed, setAudioPlayed] = useState<boolean>(false);

  const validateVoiceUrls = async (urls: {
    start?: string;
    inhale: string;
    hold: string;
    exhale: string;
    end?: string;
  }) => {
    if (!urls.inhale || !urls.exhale) {
      console.log("Voice URLs are incomplete, skipping validation");
      return false;
    }
    try {
      // Only validate URLs that are actually provided and will be used
      const urlsToValidate = [urls.inhale, urls.exhale].filter(Boolean);
      
      // Only add the hold URL to validation if it exists, is not empty, and hold phase shouldn't be skipped
      if (!skipHoldAudio && urls.hold && urls.hold.trim() !== '') {
        urlsToValidate.push(urls.hold);
      }
      
      if (urls.start) {
        urlsToValidate.push(urls.start);
      }
      
      if (urls.end) {
        urlsToValidate.push(urls.end);
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
    let audioUrl = '';
    
    switch (phaseType) {
      case 'start':
        audioUrl = voiceUrls.start || '';
        break;
      case 'inhale':
        audioUrl = voiceUrls.inhale;
        break;
      case 'hold':
        // Skip hold audio playback if skipHoldAudio is true
        if (skipHoldAudio) {
          console.log('Skipping hold audio because holdTime is 0');
          return;
        }
        // Skip if no hold URL is provided or if it's empty
        audioUrl = voiceUrls.hold && voiceUrls.hold.trim() !== '' ? voiceUrls.hold : '';
        break;
      case 'exhale':
        audioUrl = voiceUrls.exhale;
        break;
      case 'end':
        audioUrl = voiceUrls.end || '';
        break;
      default:
        audioUrl = '';
    }
    
    // If no URL for this phase (particularly for hold), just skip playing audio
    if (!audioUrl) {
      console.log(`No audio URL for ${phaseType} phase, skipping audio playback`);
      return;
    }
    
    audioLoadingRef.current = true;
    try {
      console.log(`Attempting to play ${phaseType} audio: ${audioUrl}`);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.volume = 1.0;
        
        try {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log(`Playing ${phaseType} audio successfully`);
                setAudioPlayed(true);
                audioErrorCountRef.current = 0;
              })
              .catch((playError) => {
                console.error(`Error playing ${phaseType} audio:`, playError);
                if (audioErrorCountRef.current < 5) {
                  audioErrorCountRef.current++;
                  if (audioErrorCountRef.current === 3) {
                    toast.error("Fout bij afspelen van audio. Controleer de URL's.");
                  }
                }
                if (playError.name === 'NotAllowedError') {
                  console.log("Audio playback requires user interaction");
                  toast.error("Audio kan niet automatisch worden afgespeeld. Klik op het scherm om geluid te activeren.");
                }
              });
          }
        } catch (playError) {
          console.error(`Error playing ${phaseType} audio:`, playError);
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
        // If it's the hold phase and skipHoldAudio is true, skip it
        if (phase === 'hold' && skipHoldAudio) {
          console.log('Skipping hold audio because holdTime is 0');
        } 
        // If it's the hold phase and there's no URL for it, just skip
        else if (phase === 'hold' && (!voiceUrls.hold || voiceUrls.hold.trim() === '')) {
          console.log('Skipping hold audio because no URL is provided');
        } else {
          playAudio(phase);
        }
      }
      previousPhaseRef.current = phase;
    }
  }, [phase, voiceUrls, isVoiceActive, isActive, skipHoldAudio]);

  useEffect(() => {
    if (!isVoiceActive && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else if (isVoiceActive && voiceUrls && audioRef.current && isActive) {
      // Don't try to play audio for hold phase if skipHoldAudio is true
      if (phase === 'hold' && skipHoldAudio) {
        console.log('Skipping initial hold audio because holdTime is 0');
      }
      // Don't try to play audio for hold phase if no URL exists
      else if (phase === 'hold' && (!voiceUrls.hold || voiceUrls.hold.trim() === '')) {
        console.log('Skipping initial hold audio because no URL is provided');
      } else {
        playAudio(phase);
      }
    }
  }, [isVoiceActive, voiceUrls, isActive, phase, skipHoldAudio]);

  useEffect(() => {
    if (voiceUrls && isVoiceActive) {
      validateVoiceUrls(voiceUrls);
    }
  }, [voiceUrls, isVoiceActive, skipHoldAudio]);

  return {
    audioRef,
    playAudio,
    audioPlayed
  };
};

const BreathingAudio: React.FC<BreathingAudioProps> = (props) => {
  const { audioRef, audioPlayed } = useBreathingAudio(props);

  // Log when component renders
  useEffect(() => {
    console.log("BreathingAudio component rendered", props);
  }, [props]);

  return (
    <>
      <audio 
        ref={audioRef} 
        style={{ display: 'none' }} 
        controls={false} 
        preload="auto"
        onError={() => {
          console.error("Audio element error");
        }}
      />
      {!audioPlayed && props.isVoiceActive && (
        <div className="sr-only">
          Audio playback is activated. If you don't hear anything, check your volume settings.
        </div>
      )}
    </>
  );
};

export default BreathingAudio;
