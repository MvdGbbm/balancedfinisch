
import { useRef, useState } from "react";
import { toast } from "sonner";
import { preloadAudio } from "@/components/audio-player/utils";
import { BreathingPhase } from "./types";

export const useBreathingAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateVoiceUrls = async () => {
    const urls = {
      vera: {
        inhale: localStorage.getItem('veraVoiceUrls.inhale'),
        hold: localStorage.getItem('veraVoiceUrls.hold'),
        exhale: localStorage.getItem('veraVoiceUrls.exhale')
      },
      marco: {
        inhale: localStorage.getItem('marcoVoiceUrls.inhale'),
        hold: localStorage.getItem('marcoVoiceUrls.hold'),
        exhale: localStorage.getItem('marcoVoiceUrls.exhale')
      }
    };

    const veraComplete = urls.vera.inhale && urls.vera.hold && urls.vera.exhale;
    const marcoComplete = urls.marco.inhale && urls.marco.hold && urls.marco.exhale;

    if (!veraComplete && !marcoComplete) {
      return false;
    }

    try {
      let testUrl;
      if (veraComplete) {
        testUrl = urls.vera.inhale;
      } else {
        testUrl = urls.marco.inhale;
      }

      if (testUrl) {
        const valid = await preloadAudio(testUrl);
        return valid;
      }
    } catch (error) {
      console.error("Error validating audio URLs:", error);
    }

    return false;
  };

  const playAudio = async (audioUrl: string, phaseType?: BreathingPhase, holdDuration?: number) => {
    // Skip playing audio if this is a hold phase and duration is 0
    if (phaseType === 'hold' && holdDuration === 0) {
      console.log('Skipping hold audio because duration is 0');
      return false;
    }
    
    if (!audioUrl || !audioRef.current || isLoading) {
      return false;
    }

    setIsLoading(true);
    setAudioError(false);

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      audioRef.current.src = audioUrl;
      audioRef.current.load();

      await audioRef.current.play();
      console.log(`Playing audio successfully: ${audioUrl}`);
      return true;
    } catch (error) {
      console.error("Error playing audio:", error);
      setAudioError(true);
      
      if (error.name !== 'NotAllowedError') {
        toast.error("Fout bij afspelen van audio. Controleer de URL.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return {
    audioRef,
    audioError,
    isLoading,
    playAudio,
    stopAudio,
    validateVoiceUrls
  };
};

export default useBreathingAudio;
