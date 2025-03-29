
import { useState, useEffect } from "react";
import { BreathingPattern } from "../types";

interface UseBreathingPhasesProps {
  pattern: BreathingPattern | null;
  isActive: boolean;
  exerciseCompleted: boolean;
}

export function useBreathingPhases({ 
  pattern, 
  isActive, 
  exerciseCompleted 
}: UseBreathingPhasesProps) {
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale");
  const [currentCycle, setCurrentCycle] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [circleScale, setCircleScale] = useState(1);

  // Reset state when pattern changes
  useEffect(() => {
    if (pattern) {
      setCurrentPhase("inhale");
      setCurrentCycle(1);
      setSecondsLeft(pattern.inhale);
      setProgress(0);
      setCircleScale(1);
    }
  }, [pattern]);

  // Main breathing timer effect
  useEffect(() => {
    if (!pattern) return;
    
    let timer: number | null = null;
    let progressTimer: number | null = null;
    
    if (isActive && !exerciseCompleted) {
      timer = window.setInterval(() => {
        if (secondsLeft > 1) {
          setSecondsLeft(seconds => seconds - 1);
        } else {
          // Transition to next phase
          if (currentPhase === "inhale") {
            // Skip hold1 phase if hold1 is 0 seconds or less
            if (pattern.hold1 <= 0) {
              setCurrentPhase("exhale");
              setSecondsLeft(pattern.exhale);
              setProgress(0);
            } else {
              setCurrentPhase("hold1");
              setSecondsLeft(pattern.hold1);
              setProgress(0);
              setCircleScale(1.5);
            }
          } else if (currentPhase === "hold1") {
            setCurrentPhase("exhale");
            setSecondsLeft(pattern.exhale);
            setProgress(0);
          } else if (currentPhase === "exhale") {
            // Skip hold2 phase if hold2 is 0 seconds or less
            if (pattern.hold2 <= 0) {
              if (currentCycle < pattern.cycles) {
                setCurrentCycle(cycle => cycle + 1);
                setCurrentPhase("inhale");
                setSecondsLeft(pattern.inhale);
                setProgress(0);
                setCircleScale(1);
              } else {
                // Exercise complete, handled by parent component
                setCurrentCycle(1);
                setCurrentPhase("inhale");
                setSecondsLeft(pattern.inhale);
                setProgress(0);
                setCircleScale(1);
              }
            } else {
              setCurrentPhase("hold2");
              setSecondsLeft(pattern.hold2);
              setProgress(0);
              setCircleScale(1);
            }
          } else if (currentPhase === "hold2") {
            if (currentCycle < pattern.cycles) {
              setCurrentCycle(cycle => cycle + 1);
              setCurrentPhase("inhale");
              setSecondsLeft(pattern.inhale);
              setProgress(0);
              setCircleScale(1);
            } else {
              // Exercise complete, handled by parent component
              setCurrentCycle(1);
              setCurrentPhase("inhale");
              setSecondsLeft(pattern.inhale);
              setProgress(0);
              setCircleScale(1);
            }
          }
        }
      }, 1000);
      
      // Progress bar animation
      const getCurrentPhaseDuration = () => {
        switch (currentPhase) {
          case "inhale": return pattern.inhale;
          case "hold1": return pattern.hold1;
          case "exhale": return pattern.exhale;
          case "hold2": return pattern.hold2;
          default: return 1;
        }
      };
      
      const phaseDuration = getCurrentPhaseDuration() * 1000;
      const startTime = Date.now();
      
      progressTimer = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const calculatedProgress = elapsed / phaseDuration * 100;
        setProgress(Math.min(calculatedProgress, 100));
      }, 16);
    }
    
    return () => {
      if (timer) clearInterval(timer);
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [isActive, currentPhase, secondsLeft, currentCycle, pattern, exerciseCompleted]);

  // Function to check if cycle is complete
  const isCycleComplete = () => {
    return currentCycle >= (pattern?.cycles || 1) && currentPhase === "hold2";
  };

  return {
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
  };
}
