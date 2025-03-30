
import React, { useRef, useEffect } from "react";

interface AudioHandlerProps {
  currentAudioUrl: string;
  isActive: boolean;
  onError: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export function AudioHandler({ 
  currentAudioUrl, 
  isActive,
  onError,
  audioRef
}: AudioHandlerProps) {
  return (
    <audio 
      ref={audioRef} 
      src={currentAudioUrl} 
      preload="auto" 
      onError={onError} 
    />
  );
}
