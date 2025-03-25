
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
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("rest");
  const [progress, setProgress] = useState(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);

  // Use the prop currentPhase if provided, otherwise use the internal state
  const activePhase = currentPhase || phase;

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

    // Initialize progress immediately
    calculateProgress();

    const interval = setInterval(() => {
      const phaseComplete = calculateProgress();
      
      if (phaseComplete) {
        // Reset progress to 0 before changing phase to ensure smooth transition
        setProgress(0);
        
        if (currentPhaseLocal === "inhale") {
          setPhase("hold");
          currentPhaseLocal = "hold";
          phaseDuration = holdDuration;
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
    }, 16); // ~60fps for smooth animation

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

  const getScaleForPhase = () => {
    switch (activePhase) {
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
        <div className="absolute inset-0 rounded-full bg-gray-900/30 backdrop-blur-sm shadow-[0_0_40px_rgba(0,0,0,0.3)]" />
        
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full", 
            getScaleForPhase(),
            className
          )}
          style={{
            transition: `transform ${getTransitionDuration()}ms ease-in-out, 
                        box-shadow ${getTransitionDuration()}ms ease-in-out, 
                        background-color ${getTransitionDuration()}ms ease-in-out`
          }}
        >
          <div 
            className={cn("h-full w-full rounded-full flex items-center justify-center", {
              "bg-gradient-to-r from-blue-600/90 to-blue-400/90 shadow-[0_0_30px_rgba(59,130,246,0.5)]": activePhase === "rest",
              "bg-gradient-to-r from-cyan-500/90 to-teal-400/90 shadow-[0_0_30px_rgba(20,184,166,0.6)]": activePhase === "inhale",
              "bg-gradient-to-r from-violet-500/90 to-purple-400/90 shadow-[0_0_30px_rgba(139,92,246,0.6)]": activePhase === "hold",
              "bg-gradient-to-r from-indigo-600/90 to-blue-500/90 shadow-[0_0_30px_rgba(99,102,241,0.5)]": activePhase === "exhale"
            })}
            style={{
              transition: `background ${getTransitionDuration()}ms ease-in-out, 
                          box-shadow ${getTransitionDuration()}ms ease-in-out`
            }}
          >
            <div 
              className="text-center text-white"
              style={{
                transition: `opacity ${getTransitionDuration() / 2}ms ease-in-out`
              }}
            >
              {activePhase === "rest" ? (
                <div className="flex flex-col items-center justify-center space-y-2 px-6 py-4">
                  <span className="text-lg font-medium">Klaar</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-2xl font-semibold mb-1 drop-shadow-lg">
                    {activePhase === "inhale" ? "Adem in" : activePhase === "hold" ? "Houd vast" : "Adem uit"}
                  </div>
                  <div className="flex items-center justify-center text-4xl font-bold drop-shadow-lg">
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
