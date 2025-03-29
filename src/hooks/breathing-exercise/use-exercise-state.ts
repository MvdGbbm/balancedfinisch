
import { useState, useRef } from "react";
import { toast } from "sonner";
import { BreathingPhase } from "@/components/breathing/types";
import { BreathingPattern } from "@/components/breathing-page/types";

export function useExerciseState(selectedPattern: BreathingPattern | null) {
  // Exercise state
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [activeVoice, setActiveVoice] = useState<"vera" | "marco" | null>(null);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>("start");
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  
  // Audio refs
  const startAudioRef = useRef<HTMLAudioElement | null>(null);
  const endAudioRef = useRef<HTMLAudioElement | null>(null);

  const resetExerciseState = () => {
    setIsExerciseActive(false);
    setActiveVoice(null);
    setCurrentPhase("start");
    setCurrentCycle(1);
    setExerciseCompleted(false);
    setShowAnimation(true);
  };

  const handlePhaseChange = (phase: BreathingPhase) => {
    setCurrentPhase(phase);
    
    if (phase === "inhale" && currentPhase === "pause") {
      if (selectedPattern && currentCycle < selectedPattern.cycles) {
        setCurrentCycle(prevCycle => prevCycle + 1);
      } else if (selectedPattern && currentCycle >= selectedPattern.cycles && phase === "inhale") {
        handleExerciseComplete();
      }
    }
  };

  const handleExerciseComplete = () => {
    setIsExerciseActive(false);
    setExerciseCompleted(true);
    setShowAnimation(true);
    
    if (selectedPattern?.endUrl && endAudioRef.current) {
      try {
        endAudioRef.current.src = selectedPattern.endUrl;
        endAudioRef.current.load();
        endAudioRef.current.play().catch(err => {
          console.error("Error playing end audio:", err);
          toast.error("Kon audio niet afspelen");
        });
      } catch (error) {
        console.error("Error with end audio:", error);
      }
    }
    
    toast.success("Ademhalingsoefening voltooid!");
  };

  return {
    isExerciseActive,
    setIsExerciseActive,
    activeVoice,
    setActiveVoice,
    currentPhase,
    setCurrentPhase,
    showAnimation,
    setShowAnimation,
    currentCycle,
    setCurrentCycle,
    exerciseCompleted,
    setExerciseCompleted,
    startAudioRef,
    endAudioRef,
    resetExerciseState,
    handlePhaseChange,
    handleExerciseComplete
  };
}
