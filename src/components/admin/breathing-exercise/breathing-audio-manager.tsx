
import React from "react";
import { BreathingPattern } from "@/lib/types";
import { BreathingExerciseState } from "./types";
import { useBreathingAudioManager } from "./audio/use-breathing-audio-manager";

interface BreathingAudioManagerProps {
  pattern: BreathingPattern;
  state: BreathingExerciseState;
  setState: React.Dispatch<React.SetStateAction<BreathingExerciseState>>;
}

export function BreathingAudioManager({ 
  pattern, 
  state, 
  setState 
}: BreathingAudioManagerProps) {
  const { audioRef, endAudioRef } = useBreathingAudioManager({
    pattern,
    state,
    setState
  });

  return (
    <>
      <audio ref={audioRef} style={{ display: 'none' }} />
      <audio ref={endAudioRef} style={{ display: 'none' }} />
    </>
  );
}
