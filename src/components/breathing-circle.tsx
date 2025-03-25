
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
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);

  // Reset state when isActive changes
  useEffect(() => {
    if (isActive) {
      setPhase("inhale");
      setPhaseTimeLeft(Math.ceil(inhaleDuration / 1000));
      setPhaseProgress(0);
    } else {
      setPhase("rest");
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
      const progress = (elapsed / phaseDuration) * 100;
      
      setPhaseTimeLeft(Math.ceil(remaining / 1000));
      setPhaseProgress(Math.min(100, progress));
      
      return elapsed >= phaseDuration;
    };

    // Initialize progress immediately
    calculateProgress();

    const interval = setInterval(() => {
      const phaseComplete = calculateProgress();
      
      if (phaseComplete) {
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
        setPhaseProgress(0);
      }
    }, 16); // ~60fps for smooth animation

    return () => clearInterval(interval);
  }, [isActive, inhaleDuration, holdDuration, exhaleDuration, onBreathComplete, phase]);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Fixed height container to prevent layout shifts */}
      <div className="relative h-[250px] w-[250px] flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-black/40 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.5)]" />
        
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full",
            // Set transition duration based on the current phase
            phase === "inhale" 
              ? `transition-all duration-[${inhaleDuration}ms] ease-in-out` 
              : phase === "exhale" 
                ? `transition-all duration-[${exhaleDuration}ms] ease-in-out` 
                : "transition-all duration-300 ease-in-out",
            // Scale based on phase
            phase === "inhale" || phase === "hold" ? "scale-[1.5]" : "scale-[1]",
            className
          )}
          style={{
            // Use inline style to ensure exact timing
            transitionDuration: 
              phase === "inhale" ? `${inhaleDuration}ms` : 
              phase === "exhale" ? `${exhaleDuration}ms` : 
              phase === "hold" ? `${holdDuration}ms` : 
              "300ms"
          }}
        >
          <div 
            className={cn(
              "h-full w-full rounded-full flex items-center justify-center transition-all duration-1000 shadow-[0_0_30px_rgba(59,130,246,0.5)]", 
              {
                "bg-gradient-to-r from-blue-600 to-blue-500": phase === "rest",
                "bg-gradient-to-r from-blue-600 to-cyan-500": phase === "inhale",
                "bg-gradient-to-r from-purple-500 to-blue-400": phase === "hold",
                "bg-gradient-to-r from-indigo-600 to-blue-500": phase === "exhale"
              }
            )}
          >
            <div className="text-center text-white">
              {phase === "rest" ? (
                <div className="flex flex-col items-center justify-center space-y-2 px-6 py-4 transition-opacity duration-500">
                  <span className="text-lg font-medium">Klaar</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2 transition-opacity duration-500">
                  <div className="text-2xl font-semibold">
                    {phase === "inhale" ? "Adem in" : phase === "hold" ? "Vasthouden" : "Adem uit"}
                  </div>
                  <div className="flex items-center justify-center text-4xl font-bold">
                    {phaseTimeLeft}
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
