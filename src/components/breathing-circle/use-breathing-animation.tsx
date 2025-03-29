
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
  const [state, setState] = useState<BreathingAnimationState>({
    phase: "rest",
    progress: 0,
    phaseTimeLeft: 0,
    circleScale: 0.5
  });
  
  const { phase, progress, phaseTimeLeft, circleScale } = state;
  
  // Determine if hold phase should be shown
  const shouldShowHoldPhase = holdDuration > 0;

  // Initialize state when activity status changes
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
    let maxSeconds = 1;
    
    switch (activePhase) {
      case "inhale": maxSeconds = Math.ceil(inhaleDuration / 1000); break;
      case "hold": maxSeconds = shouldShowHoldPhase ? Math.ceil(holdDuration / 1000) : 0; break;
      case "exhale": maxSeconds = Math.ceil(exhaleDuration / 1000); break;
    }

    if (secondsLeft && maxSeconds > 0) {
      const percentComplete = (maxSeconds - secondsLeft) / maxSeconds;
      
      if (activePhase === "inhale") {
        // Expand from 50% to 100% during inhale
        setState(prev => ({
          ...prev,
          circleScale: 0.5 + (percentComplete * 0.5)
        }));
      } else if (activePhase === "hold" && shouldShowHoldPhase) {
        // Stay at 100% during hold
        setState(prev => ({
          ...prev,
          circleScale: 1.0
        }));
      } else if (activePhase === "exhale") {
        // Shrink from 100% back to 50% during exhale
        setState(prev => ({
          ...prev,
          circleScale: 1.0 - (percentComplete * 0.5)
        }));
      } else {
        // Rest at 50%
        setState(prev => ({
          ...prev,
          circleScale: 0.5
        }));
      }
    } else {
      if (activePhase === "inhale") {
        // Expand from 50% to 100% during inhale
        setState(prev => ({
          ...prev,
          circleScale: 0.5 + (progress / 100) * 0.5
        }));
      } else if (activePhase === "hold" && shouldShowHoldPhase) {
        // Stay at 100% during hold
        setState(prev => ({
          ...prev,
          circleScale: 1.0
        }));
      } else if (activePhase === "exhale") {
        // Shrink from 100% back to 50% during exhale
        setState(prev => ({
          ...prev,
          circleScale: 1.0 - (progress / 100) * 0.5
        }));
      } else {
        // Rest at 50%
        setState(prev => ({
          ...prev,
          circleScale: 0.5
        }));
      }
    }
  }, [currentPhase, phase, progress, isActive, secondsLeft, inhaleDuration, holdDuration, exhaleDuration, shouldShowHoldPhase]);

  // Animation timer effect
  useEffect(() => {
    if (!isActive) {
      return;
    }
    
    let startTime = Date.now();
    let currentPhaseLocal = phase;
    let phaseDuration = currentPhaseLocal === "inhale" ? inhaleDuration : 
                      currentPhaseLocal === "hold" ? (shouldShowHoldPhase ? holdDuration : 0) : 
                      exhaleDuration;
    
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
        
        if (currentPhaseLocal === "inhale") {
          // Skip hold phase if holdDuration is 0
          if (shouldShowHoldPhase) {
            setState(prev => ({ ...prev, phase: "hold" }));
            currentPhaseLocal = "hold";
            phaseDuration = holdDuration;
          } else {
            setState(prev => ({ ...prev, phase: "exhale" }));
            currentPhaseLocal = "exhale";
            phaseDuration = exhaleDuration;
          }
        } else if (currentPhaseLocal === "hold") {
          setState(prev => ({ ...prev, phase: "exhale" }));
          currentPhaseLocal = "exhale";
          phaseDuration = exhaleDuration;
        } else {
          if (onBreathComplete) onBreathComplete();
          setState(prev => ({ ...prev, phase: "inhale" }));
          currentPhaseLocal = "inhale";
          phaseDuration = inhaleDuration;
        }
        
        startTime = Date.now();
        setState(prev => ({ 
          ...prev, 
          phaseTimeLeft: Math.ceil(phaseDuration / 1000) 
        }));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isActive, inhaleDuration, holdDuration, exhaleDuration, onBreathComplete, phase, shouldShowHoldPhase]);

  const getTransitionDuration = () => {
    const activePhase = currentPhase || phase;
    switch (activePhase) {
      case "inhale": return inhaleDuration;
      case "hold": return holdDuration;
      case "exhale": return exhaleDuration;
      default: return 1000;
    }
  };

  return {
    phase: currentPhase || phase,
    progress,
    phaseTimeLeft,
    circleScale,
    getTransitionDuration
  };
}
