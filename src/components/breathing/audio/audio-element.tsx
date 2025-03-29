
import React from 'react';
import { toast } from 'sonner';

interface AudioElementProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  onError?: () => void;
}

export const AudioElement: React.FC<AudioElementProps> = ({ 
  audioRef,
  onError 
}) => {
  const handleError = () => {
    console.error("Audio element error");
    toast.error("Fout bij afspelen van audio.");
    if (onError) onError();
  };

  return (
    <audio 
      ref={audioRef} 
      onError={handleError}
      style={{ display: 'none' }}
    />
  );
};
