
import { useState, useEffect, RefObject } from "react";
import { BreathingPattern } from "@/components/breathing-page/types";
import { handleActivateVoice } from "@/components/breathing-page/utils";
import { VoiceURLs } from "@/components/breathing-page/types";
import { BreathingPhase } from "@/components/breathing/types";

interface UseAudioControlProps {
  selectedPattern: BreathingPattern | null;
  veraVoiceUrls: VoiceURLs;
  marcoVoiceUrls: VoiceURLs;
  startAudioRef: RefObject<HTMLAudioElement>;
  setActiveVoice: (voice: "vera" | "marco" | null) => void;
  setIsExerciseActive: (active: boolean) => void;
  setCurrentPhase: (phase: BreathingPhase) => void;
  setShowAnimation: (show: boolean) => void;
  setCurrentCycle: (cycle: number | ((prev: number) => number)) => void;
  setExerciseCompleted: (completed: boolean) => void;
}

export function useAudioControl({
  selectedPattern,
  veraVoiceUrls,
  marcoVoiceUrls,
  startAudioRef,
  setActiveVoice,
  setIsExerciseActive,
  setCurrentPhase,
  setShowAnimation,
  setCurrentCycle,
  setExerciseCompleted
}: UseAudioControlProps) {
  const [musicVolume, setMusicVolume] = useState<number>(0.5);

  const onActivateVoice = async (voice: "vera" | "marco") => {
    await handleActivateVoice(
      voice,
      veraVoiceUrls,
      marcoVoiceUrls,
      selectedPattern,
      startAudioRef,
      setActiveVoice,
      setIsExerciseActive,
      setCurrentPhase,
      setShowAnimation,
      setCurrentCycle,
      setExerciseCompleted
    );
  };

  const handlePauseVoice = () => {
    setIsExerciseActive(false);
  };

  const handleMusicVolumeChange = (volume: number) => {
    setMusicVolume(volume);
  };

  return {
    musicVolume,
    onActivateVoice,
    handlePauseVoice,
    handleMusicVolumeChange
  };
}
