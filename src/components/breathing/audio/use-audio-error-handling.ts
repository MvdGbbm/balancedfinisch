
import { useRef } from 'react';
import { toast } from 'sonner';

export const useAudioErrorHandling = () => {
  const audioErrorCountRef = useRef<number>(0);
  
  // Handle play errors consistently
  const handlePlayError = (error: any) => {
    if (audioErrorCountRef.current < 5) {
      audioErrorCountRef.current++;
      if (audioErrorCountRef.current === 3) {
        toast.error("Fout bij afspelen van audio. Controleer de URL's.");
      }
    }
    if (error?.name === 'NotAllowedError') {
      toast.error("Audio afspelen vereist interactie van de gebruiker. Klik ergens op de pagina.");
      console.log("Audio playback requires user interaction");
    }
  };

  const resetErrorState = () => {
    audioErrorCountRef.current = 0;
  };

  return {
    handlePlayError,
    resetErrorState,
    audioErrorCountRef
  };
};
