
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BreathingPattern } from "@/lib/types";

type BreathingPhase = "inhale" | "hold1" | "exhale" | "hold2";

export function useBreathingCycle(selectedPattern: BreathingPattern | null) {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>("inhale");
  const [currentCycle, setCurrentCycle] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Reset cycle state
  const resetCycle = () => {
    if (!selectedPattern) return;
    
    setIsActive(false);
    setCurrentPhase("inhale");
    setCurrentCycle(1);
    setSecondsLeft(selectedPattern.inhale);
  };

  // Initialize or reset seconds when pattern changes
  useEffect(() => {
    if (!selectedPattern) return;
    
    resetCycle();
  }, [selectedPattern]);

  // Breathing timer effect
  useEffect(() => {
    if (!selectedPattern || !isActive) return;
    
    let timer: number | null = null;
    
    timer = window.setInterval(() => {
      if (secondsLeft > 1) {
        setSecondsLeft(seconds => seconds - 1);
      } else {
        // Move to next phase
        if (currentPhase === "inhale") {
          setCurrentPhase("hold1");
          setSecondsLeft(selectedPattern.hold1 || 1);
        } else if (currentPhase === "hold1") {
          setCurrentPhase("exhale");
          setSecondsLeft(selectedPattern.exhale);
        } else if (currentPhase === "exhale") {
          if (selectedPattern.hold2) {
            setCurrentPhase("hold2");
            setSecondsLeft(selectedPattern.hold2);
          } else {
            if (currentCycle < selectedPattern.cycles) {
              setCurrentCycle(cycle => cycle + 1);
              setCurrentPhase("inhale");
              setSecondsLeft(selectedPattern.inhale);
            } else {
              setIsActive(false);
              setCurrentCycle(1);
              setCurrentPhase("inhale");
              setSecondsLeft(selectedPattern.inhale);
              toast.success("Ademhalingsoefening voltooid!");
            }
          }
        } else if (currentPhase === "hold2") {
          if (currentCycle < selectedPattern.cycles) {
            setCurrentCycle(cycle => cycle + 1);
            setCurrentPhase("inhale");
            setSecondsLeft(selectedPattern.inhale);
          } else {
            setIsActive(false);
            setCurrentCycle(1);
            setCurrentPhase("inhale");
            setSecondsLeft(selectedPattern.inhale);
            toast.success("Ademhalingsoefening voltooid!");
          }
        }
      }
    }, 1000);
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, currentPhase, secondsLeft, currentCycle, selectedPattern]);

  return {
    isActive,
    setIsActive,
    currentPhase,
    setCurrentPhase,
    currentCycle,
    setCurrentCycle,
    secondsLeft,
    setSecondsLeft,
    resetCycle
  };
}
