
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
  currentPhase?: "inhale" | "hold" | "exhale" | "rest";
}

export function BreathingCircle({
  inhaleDuration = 4000,
  holdDuration = 2000,
  exhaleDuration = 6000,
  className,
  onBreathComplete,
  isActive = false,
  currentPhase = "rest"
}: BreathingCircleProps) {
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);

  // Main breathing cycle effect
  useEffect(() => {
    if (!isActive) {
      return;
    }
    
    let startTime = Date.now();
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
      calculateProgress();
    }, 16); // ~60fps for smooth animation

    return () => clearInterval(interval);
  }, [isActive, inhaleDuration, holdDuration, exhaleDuration, currentPhase]);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Fixed height container to prevent layout shifts */}
      <div className="relative h-[250px] w-[250px] flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-black/40 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.5)]" />
        
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full transition-transform",
            // Scale based on phase
            {
              "scale-100": currentPhase === "rest" || currentPhase === "exhale",
              "scale-[1.5]": currentPhase === "inhale" || currentPhase === "hold",
            },
            className
          )}
          style={{
            // Use inline style for exact timing based on the current phase
            transitionDuration: 
              currentPhase === "inhale" ? `${inhaleDuration}ms` : 
              currentPhase === "exhale" ? `${exhaleDuration}ms` : 
              currentPhase === "hold" ? `${holdDuration}ms` : 
              "300ms",
            transitionTimingFunction: "ease-in-out"
          }}
        >
          <div 
            className={cn(
              "h-full w-full rounded-full flex items-center justify-center transition-all duration-1000 shadow-[0_0_30px_rgba(59,130,246,0.5)]", 
              {
                "bg-gradient-to-r from-blue-600 to-blue-500": currentPhase === "rest",
                "bg-gradient-to-r from-blue-600 to-cyan-500": currentPhase === "inhale",
                "bg-gradient-to-r from-purple-500 to-blue-400": currentPhase === "hold",
                "bg-gradient-to-r from-indigo-600 to-blue-500": currentPhase === "exhale"
              }
            )}
          >
            <div className="text-center text-white transition-opacity duration-500">
              {currentPhase === "rest" ? (
                <div className="flex flex-col items-center justify-center space-y-2 px-6 py-4">
                  <span className="text-lg font-medium">Klaar</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-2xl font-semibold">
                    {currentPhase === "inhale" ? "Adem in" : currentPhase === "hold" ? "Vasthouden" : "Adem uit"}
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
