
import { useState, useEffect } from "react";
import { UseBreathingAnimationProps, BreathingAnimationState } from "./types";

/**
 * Determines the appropriate duration for a given phase
 */
const getPhaseTimeDuration = (
  phaseType: string, 
  inhaleDuration: number, 
  holdDuration: number, 
  exhaleDuration: number, 
  shouldShowHoldPhase: boolean
): number => {
  switch (phaseType) {
    case "inhale": return inhaleDuration;
    case "hold": return shouldShowHoldPhase ? holdDuration : 0;
    case "exhale": return exhaleDuration;
    default: return 1000;
  }
};

/**
 * Determines the next breathing phase in the cycle
 */
const getNextPhase = (
  currentPhase: string, 
  shouldShowHoldPhase: boolean
): "inhale" | "hold" | "exhale" | "rest" => {
  if (currentPhase === "inhale") {
    return shouldShowHoldPhase ? "hold" : "exhale";
  } else if (currentPhase === "hold") {
    return "exhale";
  } else {
    return "inhale";
  }
};

/**
 * Returns static circle scale values based on the phase
 */
const calculateCircleScale = (
  activePhase: string,
  shouldShowHoldPhase: boolean
): number => {
  switch (activePhase) {
    case "inhale":
      return 1.0;
    case "hold":
      if (shouldShowHoldPhase) {
        return 1.0;
      }
      return 0.5;
    case "exhale":
      return 0.5;
    default:
      return 0.5;
  }
};

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
        circleScale: 1.0
      }));
    } else {
      setState(prev => ({
        ...prev,
        phase: "rest",
        progress: 0,
        circleScale: 0.5
      }));
    }
  }, [isActive, inhaleDuration]);

  // Set fixed circle scale based on current phase
  useEffect(() => {
    if (!isActive) return;

    const activePhase = currentPhase || phase;
    const newScale = calculateCircleScale(activePhase, shouldShowHoldPhase);
    
    setState(prev => ({
      ...prev,
      circleScale: newScale
    }));
  }, [currentPhase, phase, isActive, shouldShowHoldPhase]);

  // Breathing phase timer effect
  useEffect(() => {
    if (!isActive) {
      return;
    }
    
    let startTime = Date.now();
    let currentPhaseLocal = phase;
    let phaseDuration = getPhaseTimeDuration(
      currentPhaseLocal, 
      inhaleDuration, 
      holdDuration, 
      exhaleDuration, 
      shouldShowHoldPhase
    );
    
    // Calculate progress based on elapsed time
    const calculateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, phaseDuration - elapsed);
      
      setState(prev => ({
        ...prev,
        phaseTimeLeft: Math.ceil(remaining / 1000),
        progress: 100
      }));
      
      return elapsed >= phaseDuration;
    };

    // Transition to the next phase of breathing
    const transitionToNextPhase = () => {
      // Determine next phase
      const nextPhase = getNextPhase(currentPhaseLocal, shouldShowHoldPhase);
      
      setState(prev => ({ 
        ...prev, 
        phase: nextPhase,
        progress: 0,
        circleScale: calculateCircleScale(nextPhase, shouldShowHoldPhase)
      }));
      
      currentPhaseLocal = nextPhase;
      
      // Update phase duration
      phaseDuration = getPhaseTimeDuration(
        currentPhaseLocal, 
        inhaleDuration, 
        holdDuration, 
        exhaleDuration, 
        shouldShowHoldPhase
      );
      
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
    };

    calculateProgress();

    const interval = setInterval(() => {
      const phaseComplete = calculateProgress();
      
      if (phaseComplete) {
        transitionToNextPhase();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, inhaleDuration, holdDuration, exhaleDuration, onBreathComplete, phase, shouldShowHoldPhase]);

  // Helper to get transition duration for animation (now returns 0 to disable animations)
  const getTransitionDuration = () => {
    return 0;
  };

  return {
    phase: currentPhase || phase,
    progress,
    phaseTimeLeft,
    circleScale,
    getTransitionDuration
  };
}
