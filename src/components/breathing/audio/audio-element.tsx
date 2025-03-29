
import React, { useEffect } from 'react';

interface AudioElementProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  src?: string;
}

export const AudioElement: React.FC<AudioElementProps> = ({ audioRef, src }) => {
  useEffect(() => {
    // When src changes and we have a ref, update the src attribute
    if (audioRef.current && src) {
      audioRef.current.src = src;
    }
  }, [src, audioRef]);

  return <audio ref={audioRef} style={{ display: 'none' }} />;
};

export default AudioElement;
