
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BreathingPattern } from "./types";
import { useBreathingAudio } from "./hooks/use-breathing-audio";
import { useBreathingPhases } from "./hooks/use-breathing-phases";
import { useVoiceSelection } from "./hooks/use-voice-selection";

export function useBreathingTest(pattern: BreathingPattern | null) {
  const [isActive, setIsActive] = useState(false);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);

  // Use the voice selection hook
  const {
    activeVoice,
    setActiveVoice,
    veraVoiceUrls,
    marcoVoiceUrls,
    startWithVera: startVeraVoice,
    startWithMarco: startMarcoVoice
  } = useVoiceSelection();

  // Use the breathing phases hook
  const {
    currentPhase,
    currentCycle,
    secondsLeft,
    progress,
    circleScale,
    setCircleScale,
    isCycleComplete,
    setCurrentPhase,
    setCurrentCycle,
    setSecondsLeft,
    setProgress
  } = useBreathingPhases({
    pattern,
    isActive,
    exerciseCompleted,
    voiceUrls: { vera: veraVoiceUrls, marco: marcoVoiceUrls },
    activeVoice
  });

  // Use the breathing audio hook
  const {
    audioRef,
    endAudioRef,
    currentAudioUrl,
    audioError,
    playEndAudio
  } = useBreathingAudio(
    pattern,
    isActive,
    currentPhase,
    activeVoice,
    { vera: veraVoiceUrls, marco: marcoVoiceUrls }
  );

  // Reset state when pattern changes
  useEffect(() => {
    setIsActive(false);
    setExerciseCompleted(false);
    setActiveVoice(null);
  }, [pattern, setActiveVoice]);

  // Check if exercise is complete after each cycle
  useEffect(() => {
    if (isActive && pattern && currentCycle >= pattern.cycles) {
      const isLastPhase = 
        (currentPhase === "exhale" && pattern.hold2 <= 0) || 
        (currentPhase === "hold2" && secondsLeft === 1);
      
      if (isLastPhase) {
        completeExercise(pattern);
      }
    }
  }, [isActive, currentCycle, currentPhase, secondsLeft, pattern]);

  // Function to handle exercise completion
  const completeExercise = (pattern: BreathingPattern) => {
    setIsActive(false);
    setExerciseCompleted(true);
    setActiveVoice(null);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (pattern.endUrl) {
      playEndAudio(pattern.endUrl);
    }
    
    toast.success("Test voltooid!");
  };

  // Function to reset the exercise
  const resetExercise = () => {
    if (!pattern) return;
    
    setIsActive(false);
    setExerciseCompleted(false);
    setActiveVoice(null);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (endAudioRef.current) {
      endAudioRef.current.pause();
      endAudioRef.current.currentTime = 0;
    }
  };

  // Function to start with Vera voice
  const startWithVera = () => {
    const newState = !(isActive && activeVoice === "vera");
    setIsActive(newState);
    startVeraVoice(isActive);
  };

  // Function to start with Marco voice
  const startWithMarco = () => {
    const newState = !(isActive && activeVoice === "marco");
    setIsActive(newState);
    startMarcoVoice(isActive);
  };

  return {
    isActive,
    setIsActive,
    currentPhase,
    currentCycle,
    secondsLeft,
    progress,
    audioRef,
    endAudioRef,
    currentAudioUrl,
    audioError,
    activeVoice,
    circleScale,
    setCircleScale,
    exerciseCompleted,
    resetExercise,
    startWithVera,
    startWithMarco,
    totalCycles: pattern?.cycles || 0
  };
}
