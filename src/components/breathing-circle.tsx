
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BreathingCircleProps {
  duration?: number;
  className?: string;
  onBreathComplete?: () => void;
  isActive: boolean;
  currentPhase?: "inhale" | "hold" | "exhale" | "rest";
  secondsLeft?: number;
  inhaleDuration?: number;
  holdDuration?: number;
  exhaleDuration?: number;
}

export function BreathingCircle({
  inhaleDuration = 4000,
  holdDuration = 2000,
  exhaleDuration = 6000,
  className,
  onBreathComplete,
  isActive = false,
  currentPhase = "rest",
  secondsLeft = 0
}: BreathingCircleProps) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("rest");
  const [progress, setProgress] = useState(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [circleScale, setCircleScale] = useState(0.5);

  const activePhase = currentPhase || phase;

  useEffect(() => {
    if (isActive) {
      setPhase("inhale");
      setProgress(0);
      setPhaseTimeLeft(Math.ceil(inhaleDuration / 1000));
      setCircleScale(0.5); // Start at 50%
    } else {
      setPhase("rest");
      setProgress(0);
      setCircleScale(0.5); // Rest at 50%
    }
  }, [isActive, inhaleDuration]);

  useEffect(() => {
    if (!isActive) return;

    let maxSeconds = 1;
    switch (activePhase) {
      case "inhale": maxSeconds = Math.ceil(inhaleDuration / 1000); break;
      case "hold": maxSeconds = Math.ceil(holdDuration / 1000); break;
      case "exhale": maxSeconds = Math.ceil(exhaleDuration / 1000); break;
    }

    // Handle circle scaling based on phase and progress
    if (secondsLeft && maxSeconds > 0) {
      const percentComplete = (maxSeconds - secondsLeft) / maxSeconds;
      
      if (activePhase === "inhale") {
        // Expand from 50% to 100% during inhale (more dramatic expansion)
        setCircleScale(0.5 + (percentComplete * 0.5));
      } else if (activePhase === "hold") {
        // Stay at 100% during hold
        setCircleScale(1.0);
      } else if (activePhase === "exhale") {
        // Shrink from 100% back to 50% during exhale
        setCircleScale(1.0 - (percentComplete * 0.5));
      } else {
        // Rest at 50%
        setCircleScale(0.5);
      }
    } else {
      if (activePhase === "inhale") {
        // Expand from 50% to 100% during inhale
        setCircleScale(0.5 + (progress / 100) * 0.5);
      } else if (activePhase === "hold") {
        // Stay at 100% during hold
        setCircleScale(1.0);
      } else if (activePhase === "exhale") {
        // Shrink from 100% back to 50% during exhale
        setCircleScale(1.0 - (progress / 100) * 0.5);
      } else {
        // Rest at 50%
        setCircleScale(0.5);
      }
    }
  }, [activePhase, progress, isActive, secondsLeft, inhaleDuration, holdDuration, exhaleDuration]);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    
    let startTime = Date.now();
    let currentPhaseLocal = phase;
    let phaseDuration = currentPhaseLocal === "inhale" ? inhaleDuration : currentPhaseLocal === "hold" ? holdDuration : exhaleDuration;
    
    const calculateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, phaseDuration - elapsed);
      const phaseProgress = (elapsed / phaseDuration) * 100;
      setPhaseTimeLeft(Math.ceil(remaining / 1000));
      setProgress(Math.min(phaseProgress, 100));
      return elapsed >= phaseDuration;
    };

    calculateProgress();

    const interval = setInterval(() => {
      const phaseComplete = calculateProgress();
      
      if (phaseComplete) {
        setProgress(0);
        
        if (currentPhaseLocal === "inhale") {
          // Skip hold phase if holdDuration is 0
          if (holdDuration <= 0) {
            setPhase("exhale");
            currentPhaseLocal = "exhale";
            phaseDuration = exhaleDuration;
          } else {
            setPhase("hold");
            currentPhaseLocal = "hold";
            phaseDuration = holdDuration;
          }
        } else if (currentPhaseLocal === "hold") {
          setPhase("exhale");
          currentPhaseLocal = "exhale";
          phaseDuration = exhaleDuration;
        } else {
          if (onBreathComplete) onBreathComplete();
          setPhase("inhale");
          currentPhaseLocal = "inhale";
          phaseDuration = inhaleDuration;
        }
        
        startTime = Date.now();
        setPhaseTimeLeft(Math.ceil(phaseDuration / 1000));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isActive, inhaleDuration, holdDuration, exhaleDuration, onBreathComplete, phase]);

  const getTransitionDuration = () => {
    switch (activePhase) {
      case "inhale":
        return inhaleDuration;
      case "hold":
        return holdDuration;
      case "exhale":
        return exhaleDuration;
      default:
        return 1000;
    }
  };

  const getPhaseText = () => {
    switch (activePhase) {
      case "inhale": return "Adem in";
      case "hold": return holdDuration > 0 ? "Houd vast" : "";
      case "exhale": return "Adem uit";
      case "rest": return "";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative h-[280px] w-[280px] flex items-center justify-center">
        {/* Simplified breathing circle - single layer with glow */}
        <div 
          className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 blur-xl"
          style={{
            transform: `scale(${circleScale * 1.2})`,
            transition: `transform ${getTransitionDuration()}ms cubic-bezier(0.4, 0, 0.2, 1)`
          }}
        />
        
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full", 
            className
          )}
          style={{
            transform: `scale(${circleScale})`,
            transition: `transform ${getTransitionDuration()}ms cubic-bezier(0.4, 0, 0.2, 1)`
          }}
        >
          <div 
            className="h-full w-full rounded-full flex items-center justify-center bg-cyan-400"
            style={{
              transition: `background ${getTransitionDuration()}ms ease-in-out, 
                          box-shadow ${getTransitionDuration()}ms ease-in-out`
            }}
          >
            <div className="text-center text-white">
              {activePhase === "rest" ? (
                <div className="flex flex-col items-center justify-center space-y-2 px-6 py-4">
                  <span className="text-lg font-medium">Klaar</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  {getPhaseText() && (
                    <div className="text-xl font-semibold mb-1">
                      {getPhaseText()}
                    </div>
                  )}
                  {secondsLeft > 0 && (
                    <div className="flex items-center justify-center text-4xl font-bold">
                      {secondsLeft}
                      <span className="text-sm ml-1 mt-1">s</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
