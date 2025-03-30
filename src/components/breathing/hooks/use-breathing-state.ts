
import { useState, useEffect, useCallback } from "react";
import { 
  BreathingPhase, 
  BreathingSettings, 
  BreathingState 
} from "../core/types";
import { 
  getNextPhase, 
  shouldSkipPhase, 
  getPhaseDuration,
  calculateCircleScale 
} from "../core/breathing-utils";

interface UseBreathingStateParams {
  settings: BreathingSettings;
  onCycleComplete?: () => void;
  onExerciseComplete?: () => void;
}

export function useBreathingState({
  settings,
  onCycleComplete,
  onExerciseComplete
}: UseBreathingStateParams) {
  // Core state
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>("rest");
  const [currentCycle, setCurrentCycle] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [circleScale, setCircleScale] = useState(0.5); // Start at 50%
  const [exerciseCompleted, setExerciseCompleted] = useState(false);

  // Helper to advance to the next phase
  const advanceToNextPhase = useCallback(() => {
    if (!isActive) return;
    
    let nextPhase = getNextPhase(currentPhase, shouldSkipPhase("hold", { holdDuration: settings.holdDuration }));
    
    // If the next phase is pause and we should skip it, get the phase after
    if (nextPhase === "pause" && shouldSkipPhase("pause", { pauseDuration: settings.pauseDuration })) {
      nextPhase = "inhale";
      
      // If we've completed a cycle
      if (currentPhase === "exhale" || currentPhase === "pause") {
        if (currentCycle < settings.cycles) {
          setCurrentCycle(cycle => cycle + 1);
          if (onCycleComplete) {
            onCycleComplete();
          }
        } else {
          // Exercise complete
          setIsActive(false);
          setExerciseCompleted(true);
          setCurrentPhase("rest");
          if (onExerciseComplete) {
            onExerciseComplete();
          }
          return;
        }
      }
    }
    
    setCurrentPhase(nextPhase);
    
    // Set new phase duration
    const newPhaseDuration = getPhaseDuration(nextPhase, settings);
    setSecondsLeft(newPhaseDuration);
    setProgress(0);
  }, [
    isActive, 
    currentPhase, 
    currentCycle, 
    settings, 
    onCycleComplete, 
    onExerciseComplete
  ]);

  // Reset all state
  const resetExercise = useCallback(() => {
    setIsActive(false);
    setCurrentPhase("rest");
    setCurrentCycle(1);
    setSecondsLeft(getPhaseDuration("inhale", settings));
    setProgress(0);
    setCircleScale(0.5);
    setExerciseCompleted(false);
  }, [settings]);

  // Start exercise
  const startExercise = useCallback(() => {
    setIsActive(true);
    setCurrentPhase("inhale");
    setCurrentCycle(1);
    setSecondsLeft(getPhaseDuration("inhale", settings));
    setProgress(0);
    setCircleScale(0.5);
    setExerciseCompleted(false);
  }, [settings]);

  // Toggle exercise state
  const toggleExercise = useCallback(() => {
    if (isActive) {
      setIsActive(false);
    } else {
      if (exerciseCompleted) {
        resetExercise();
        startExercise();
      } else {
        startExercise();
      }
    }
  }, [isActive, exerciseCompleted, resetExercise, startExercise]);

  // Main timer effect
  useEffect(() => {
    if (!isActive) return;
    
    const timerInterval = setInterval(() => {
      setSecondsLeft(seconds => {
        if (seconds <= 1) {
          // Time for next phase
          advanceToNextPhase();
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    
    // Progress animation
    const animationInterval = setInterval(() => {
      setProgress(prev => {
        const phaseDuration = getPhaseDuration(currentPhase, settings);
        const increment = 100 / (phaseDuration * 60); // Update 60 times per second
        return Math.min(prev + increment, 100);
      });
    }, 16); // ~60fps
    
    return () => {
      clearInterval(timerInterval);
      clearInterval(animationInterval);
    };
  }, [isActive, currentPhase, settings, advanceToNextPhase]);

  // Handle circle scaling based on phase
  useEffect(() => {
    if (!isActive) {
      setCircleScale(0.5); // Reset to base size when inactive
      return;
    }
    
    const phaseDuration = getPhaseDuration(currentPhase, settings);
    
    setCircleScale(
      calculateCircleScale(
        currentPhase, 
        progress, 
        secondsLeft, 
        phaseDuration
      )
    );
  }, [isActive, currentPhase, progress, secondsLeft, settings]);

  // Combine state into a single object for easier passing
  const state: BreathingState = {
    isActive,
    currentPhase,
    currentCycle,
    secondsLeft,
    progress,
    circleScale,
    exerciseCompleted
  };

  return {
    state,
    startExercise,
    stopExercise: () => setIsActive(false),
    resetExercise,
    toggleExercise,
    setCurrentPhase,
    setCurrentCycle
  };
}
