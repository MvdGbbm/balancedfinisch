
import React from 'react';

interface AudioElementProps {
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const AudioElement: React.FC<AudioElementProps> = ({ audioRef }) => {
  return <audio ref={audioRef} style={{ display: 'none' }} />;
};

export default AudioElement;
