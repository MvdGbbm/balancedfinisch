
import { useState, useEffect } from "react";
import { UseBreathingAnimationProps, BreathingAnimationState } from "./types";

export function useBreathingAnimation({
  inhaleDuration,
  holdDuration,
  exhaleDuration,
  isActive,
  currentPhase = "rest",
  secondsLeft,
  onBreathComplete
}: UseBreathingAnimationProps) {
  // Initialize state with default values
  const [state, setState] = useState<BreathingAnimationState>({
    phase: "rest",
    progress: 0,
    phaseTimeLeft: 0,
    circleScale: 0.5
  });
  
  const { phase, progress, phaseTimeLeft, circleScale } = state;
  
  // Determine if hold phase should be shown
  const shouldShowHoldPhase = holdDuration > 0;

  // Handle initialization when activity status changes
  useEffect(() => {
    if (isActive) {
      setState(prev => ({
        ...prev,
        phase: "inhale",
        progress: 0,
        phaseTimeLeft: Math.ceil(inhaleDuration / 1000),
        circleScale: 0.5 // Start at 50%
      }));
    } else {
      setState(prev => ({
        ...prev,
        phase: "rest",
        progress: 0,
        circleScale: 0.5 // Rest at 50%
      }));
    }
  }, [isActive, inhaleDuration]);

  // Handle circle scaling based on phase and progress
  useEffect(() => {
    if (!isActive) return;

    const activePhase = currentPhase || phase;
    const scaleCircleBasedOnPhase = () => {
      // Calculate maximum seconds for current phase
      let maxSeconds = 1;
      switch (activePhase) {
        case "inhale": maxSeconds = Math.ceil(inhaleDuration / 1000); break;
        case "hold": maxSeconds = shouldShowHoldPhase ? Math.ceil(holdDuration / 1000) : 0; break;
        case "exhale": maxSeconds = Math.ceil(exhaleDuration / 1000); break;
      }

      // Scale circle differently based on secondsLeft or progress
      if (secondsLeft !== undefined && maxSeconds > 0) {
        const percentComplete = (maxSeconds - secondsLeft) / maxSeconds;
        updateCircleScale(activePhase, percentComplete);
      } else {
        updateCircleScale(activePhase, progress / 100);
      }
    };

    scaleCircleBasedOnPhase();
  }, [currentPhase, phase, progress, isActive, secondsLeft, inhaleDuration, holdDuration, exhaleDuration, shouldShowHoldPhase]);

  // Helper function to update circle scale based on phase and progress
  const updateCircleScale = (activePhase: string, progressRatio: number) => {
    switch (activePhase) {
      case "inhale":
        // Expand from 50% to 100% during inhale
        setState(prev => ({
          ...prev,
          circleScale: 0.5 + (progressRatio * 0.5)
        }));
        break;
      case "hold":
        if (shouldShowHoldPhase) {
          // Stay at 100% during hold
          setState(prev => ({
            ...prev,
            circleScale: 1.0
          }));
        }
        break;
      case "exhale":
        // Shrink from 100% back to 50% during exhale
        setState(prev => ({
          ...prev,
          circleScale: 1.0 - (progressRatio * 0.5)
        }));
        break;
      default:
        // Rest at 50%
        setState(prev => ({
          ...prev,
          circleScale: 0.5
        }));
    }
  };

  // Breathing animation timer effect
  useEffect(() => {
    if (!isActive) {
      return;
    }
    
    let startTime = Date.now();
    let currentPhaseLocal = phase;
    let phaseDuration = getPhaseTimeDuration(currentPhaseLocal);
    
    const calculateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, phaseDuration - elapsed);
      const phaseProgress = (elapsed / phaseDuration) * 100;
      
      setState(prev => ({
        ...prev,
        phaseTimeLeft: Math.ceil(remaining / 1000),
        progress: Math.min(phaseProgress, 100)
      }));
      
      return elapsed >= phaseDuration;
    };

    calculateProgress();

    const interval = setInterval(() => {
      const phaseComplete = calculateProgress();
      
      if (phaseComplete) {
        setState(prev => ({ ...prev, progress: 0 }));
        
        // Determine next phase
        const nextPhase = getNextPhase(currentPhaseLocal);
        setState(prev => ({ ...prev, phase: nextPhase }));
        currentPhaseLocal = nextPhase;
        
        // Update phase duration
        phaseDuration = getPhaseTimeDuration(currentPhaseLocal);
        
        // Trigger breath complete callback when exhale ends
        if (currentPhaseLocal === "inhale" && onBreathComplete) {
          onBreathComplete();
        }
        
        // Reset timer
        startTime = Date.now();
        setState(prev => ({ 
          ...prev, 
          phaseTimeLeft: Math.ceil(phaseDuration / 1000) 
        }));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isActive, inhaleDuration, holdDuration, exhaleDuration, onBreathComplete, phase, shouldShowHoldPhase]);

  // Helper to determine the next breathing phase
  const getNextPhase = (currentPhaseLocal: string): "inhale" | "hold" | "exhale" | "rest" => {
    if (currentPhaseLocal === "inhale") {
      return shouldShowHoldPhase ? "hold" : "exhale";
    } else if (currentPhaseLocal === "hold") {
      return "exhale";
    } else {
      return "inhale";
    }
  };

  // Helper to get the duration for a specific phase
  const getPhaseTimeDuration = (phaseType: string): number => {
    switch (phaseType) {
      case "inhale": return inhaleDuration;
      case "hold": return shouldShowHoldPhase ? holdDuration : 0;
      case "exhale": return exhaleDuration;
      default: return 1000;
    }
  };

  // Helper to get transition duration for animation
  const getTransitionDuration = () => {
    const activePhase = currentPhase || phase;
    return getPhaseTimeDuration(activePhase);
  };

  return {
    phase: currentPhase || phase,
    progress,
    phaseTimeLeft,
    circleScale,
    getTransitionDuration
  };
}
