
import React from "react";
import { BreathingAudioPlayerProps } from "./types";

export function BreathingAudioPlayer({ 
  audioRef,
  currentAudioUrl,
  onAudioError
}: BreathingAudioPlayerProps) {
  return (
    <audio 
      ref={audioRef} 
      src={currentAudioUrl} 
      preload="auto" 
      onError={onAudioError} 
    />
  );
}
