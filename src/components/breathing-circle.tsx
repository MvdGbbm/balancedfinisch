
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BreathingCircleProps {
  duration?: number;
  inhaleDuration?: number;
  holdDuration?: number;
  exhaleDuration?: number;
  className?: string;
  onBreathComplete?: () => void;
  isActive: boolean;
}

export function BreathingCircle({
  inhaleDuration = 4000,
  holdDuration = 2000,
  exhaleDuration = 6000,
  className,
  onBreathComplete,
  isActive = false
}: BreathingCircleProps) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("rest");
  const [progress, setProgress] = useState(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);

  // Reset state when isActive changes
  useEffect(() => {
    if (isActive) {
      setPhase("inhale");
      setProgress(0);
      setPhaseTimeLeft(Math.ceil(inhaleDuration / 1000));
    } else {
      setPhase("rest");
      setProgress(0);
    }
  }, [isActive, inhaleDuration]);

  // Main breathing cycle effect
  useEffect(() => {
    if (!isActive) {
      return;
    }
    
    let startTime = Date.now();
    let currentPhase = phase;
    let phaseDuration = currentPhase === "inhale" ? inhaleDuration : currentPhase === "hold" ? holdDuration : exhaleDuration;
    
    const calculateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, phaseDuration - elapsed);
      const phaseProgress = (elapsed / phaseDuration) * 100;
      setPhaseTimeLeft(Math.ceil(remaining / 1000));
      setProgress(Math.min(phaseProgress, 100));
      return elapsed >= phaseDuration;
    };

    // Initialize progress immediately
    calculateProgress();

    const interval = setInterval(() => {
      const phaseComplete = calculateProgress();
      
      if (phaseComplete) {
        // Reset progress to 0 before changing phase to ensure smooth transition
        setProgress(0);
        
        if (currentPhase === "inhale") {
          setPhase("hold");
          currentPhase = "hold";
          phaseDuration = holdDuration;
        } else if (currentPhase === "hold") {
          setPhase("exhale");
          currentPhase = "exhale";
          phaseDuration = exhaleDuration;
        } else {
          if (onBreathComplete) onBreathComplete();
          setPhase("inhale");
          currentPhase = "inhale";
          phaseDuration = inhaleDuration;
        }
        
        startTime = Date.now();
        setPhaseTimeLeft(Math.ceil(phaseDuration / 1000));
      }
    }, 16); // ~60fps for smooth animation

    return () => clearInterval(interval);
  }, [isActive, inhaleDuration, holdDuration, exhaleDuration, onBreathComplete, phase]);

  const getScaleForPhase = () => {
    switch (phase) {
      case "inhale":
        return "scale-[1.5]"; // Larger scale for inhale
      case "hold":
        return "scale-[1.5]"; // Stay expanded during hold
      case "exhale":
        return "scale-[1]"; // Contract to normal size during exhale
      case "rest":
      default:
        return "scale-[1]"; // Default resting state
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Fixed height container to prevent layout shifts */}
      <div className="relative h-[280px] w-[280px] flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gray-900 shadow-[0_0_40px_rgba(0,0,0,0.6)]" />
        
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full transition-all duration-1000 ease-in-out", 
            getScaleForPhase(),
            className
          )}
        >
          <div 
            className={cn("h-full w-full rounded-full flex items-center justify-center transition-all shadow-[0_0_30px_rgba(0,100,255,0.4)]", {
              "bg-gradient-to-r from-blue-600 to-blue-500": phase === "rest",
              "bg-gradient-to-r from-blue-600 to-cyan-500": phase === "inhale",
              "bg-gradient-to-r from-purple-500 to-amber-400": phase === "hold",
              "bg-gradient-to-r from-indigo-600 to-blue-500": phase === "exhale"
            })}
          >
            <div className="text-center text-white">
              {phase === "rest" ? (
                <div className="flex flex-col items-center justify-center space-y-2 px-6 py-4">
                  <span className="text-lg font-medium">Klaar</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-2xl font-semibold mb-1">
                    {phase === "inhale" ? "Adem in" : phase === "hold" ? "Houd vast" : "Adem uit"}
                  </div>
                  <div className="flex items-center justify-center text-4xl font-bold">
                    {phaseTimeLeft}
                    <span className="text-sm ml-1 mt-1">s</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
