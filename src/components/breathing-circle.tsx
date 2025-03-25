
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
  secondsLeft?: number;
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
      setCircleScale(0.5);
    } else {
      setPhase("rest");
      setProgress(0);
      setCircleScale(0.5);
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

    if (secondsLeft && maxSeconds > 0) {
      const percentComplete = (maxSeconds - secondsLeft) / maxSeconds;
      
      if (activePhase === "inhale") {
        // Expand from 50% to 90% during inhale
        setCircleScale(0.5 + (percentComplete * 0.4));
      } else if (activePhase === "hold") {
        // Stay at 90% during hold
        setCircleScale(0.9);
      } else if (activePhase === "exhale") {
        // Shrink from 90% back to 50% during exhale
        setCircleScale(0.9 - (percentComplete * 0.4));
      } else {
        // Rest at 50%
        setCircleScale(0.5);
      }
    } else {
      if (activePhase === "inhale") {
        // Expand from 50% to 90% during inhale
        setCircleScale(0.5 + (progress / 100) * 0.4);
      } else if (activePhase === "hold") {
        // Stay at 90% during hold
        setCircleScale(0.9);
      } else if (activePhase === "exhale") {
        // Shrink from 90% back to 50% during exhale
        setCircleScale(0.9 - (progress / 100) * 0.4);
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

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative h-[280px] w-[280px] flex items-center justify-center">
        <div 
          className={cn(
            "absolute inset-0 rounded-full opacity-70 blur-xl transition-all duration-1000", 
            {
              "bg-blue-400/30": activePhase === "rest",
              "bg-cyan-400/40": activePhase === "inhale",
              "bg-violet-400/40": activePhase === "hold",
              "bg-indigo-400/30": activePhase === "exhale"
            }
          )}
          style={{
            transform: `scale(${circleScale * 1.2})`,
            transition: `transform ${getTransitionDuration()}ms cubic-bezier(0.4, 0, 0.2, 1), 
                      background-color ${getTransitionDuration()}ms ease-in-out,
                      opacity ${getTransitionDuration()}ms ease-in-out`
          }}
        />
        
        <div 
          className="absolute inset-0 rounded-full bg-black/5 dark:bg-black/20 backdrop-blur-sm shadow-[0_0_40px_rgba(0,0,0,0.1)]"
          style={{
            transform: `scale(${circleScale * 1.05})`,
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
            transition: `transform ${getTransitionDuration()}ms cubic-bezier(0.4, 0, 0.2, 1), 
                        box-shadow ${getTransitionDuration()}ms ease-in-out, 
                        background-color ${getTransitionDuration()}ms ease-in-out`
          }}
        >
          <div 
            className={cn("h-full w-full rounded-full flex items-center justify-center", {
              "bg-gradient-to-r from-blue-600/90 to-blue-400/90 shadow-[0_0_30px_rgba(59,130,246,0.5)]": activePhase === "rest",
              "bg-gradient-to-br from-cyan-500/90 to-teal-400/90 shadow-[0_0_30px_rgba(20,184,166,0.6)]": activePhase === "inhale",
              "bg-gradient-to-br from-violet-500/90 to-purple-400/90 shadow-[0_0_30px_rgba(139,92,246,0.6)]": activePhase === "hold",
              "bg-gradient-to-br from-indigo-600/90 to-blue-500/90 shadow-[0_0_30px_rgba(99,102,241,0.5)]": activePhase === "exhale"
            })}
            style={{
              transition: `background ${getTransitionDuration()}ms ease-in-out, 
                          box-shadow ${getTransitionDuration()}ms ease-in-out`
            }}
          >
            <div 
              className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] rounded-full",
                "opacity-0 dark:opacity-30",
                {
                  "animate-pulse-gentle": isActive
                }
              )}
            >
              <div className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-white/60 -translate-x-1/2 blur-sm" />
              <div className="absolute bottom-0 left-1/2 w-2 h-2 rounded-full bg-white/60 -translate-x-1/2 blur-sm" />
              <div className="absolute left-0 top-1/2 w-2 h-2 rounded-full bg-white/60 -translate-y-1/2 blur-sm" />
              <div className="absolute right-0 top-1/2 w-2 h-2 rounded-full bg-white/60 -translate-y-1/2 blur-sm" />
              
              <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 rounded-full bg-white/50 blur-sm" />
              <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-white/50 blur-sm" />
              <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-white/50 blur-sm" />
              <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 rounded-full bg-white/50 blur-sm" />
            </div>
            
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
                    {secondsLeft || phaseTimeLeft}
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
