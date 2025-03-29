
import { useRef } from 'react';
import { preloadAudio } from '@/components/audio-player/utils';
import { BreathingPhase } from '../types';
import { useAudioErrorHandling } from './use-audio-error-handling';

interface UseAudioPlaybackProps {
  voiceUrls: {
    start?: string;
    inhale: string;
    hold: string;
    exhale: string;
    end?: string;
  } | null;
  isVoiceActive: boolean;
}

export const useAudioPlayback = ({
  voiceUrls,
  isVoiceActive
}: UseAudioPlaybackProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioLoadingRef = useRef<boolean>(false);
  const { handlePlayError, audioErrorCountRef } = useAudioErrorHandling();

  // Play audio for a specific breathing phase
  const playAudio = async (phaseType: BreathingPhase) => {
    if (!voiceUrls || !isVoiceActive || !audioRef.current || audioLoadingRef.current) {
      console.log(`Not playing audio for ${phaseType} due to inactive state or missing refs`);
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
    
    console.log(`Attempting to play ${phaseType} audio: ${audioUrl}`);
    audioLoadingRef.current = true;
    
    try {
      const isValid = await preloadAudio(audioUrl);
      if (!isValid) {
        throw new Error(`Failed to preload ${phaseType} audio`);
      }
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.volume = 1.0;
        
        // Clear any previous event listeners to prevent memory leaks
        const oldAudio = audioRef.current;
        const clonedAudio = oldAudio.cloneNode() as HTMLAudioElement;
        oldAudio.parentNode?.replaceChild(clonedAudio, oldAudio);
        audioRef.current = clonedAudio;
        
        try {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              console.log(`Playing ${phaseType} audio successfully`);
              audioErrorCountRef.current = 0;
            }).catch(playError => {
              console.error(`Error playing ${phaseType} audio:`, playError);
              handlePlayError(playError);
            });
          }
        } catch (playError) {
          console.error(`Error in play attempt for ${phaseType} audio:`, playError);
          handlePlayError(playError);
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

  return {
    audioRef,
    playAudio,
    audioLoadingRef
  };
};

import { toast } from 'sonner';
