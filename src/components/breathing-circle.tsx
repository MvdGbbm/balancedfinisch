
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Pause, Play, Timer } from "lucide-react";

interface BreathingCircleProps {
  duration?: number;
  inhaleDuration?: number;
  holdDuration?: number;
  exhaleDuration?: number;
  className?: string;
  onBreathComplete?: () => void;
}

export function BreathingCircle({
  inhaleDuration = 4000,
  holdDuration = 2000,
  exhaleDuration = 6000,
  className,
  onBreathComplete,
}: BreathingCircleProps) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("rest");
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  
  // Breathing cycle
  useEffect(() => {
    if (!isActive) return;
    
    let startTime = Date.now();
    let currentPhase = phase;
    let phaseDuration = currentPhase === "inhale" 
      ? inhaleDuration 
      : currentPhase === "hold" 
        ? holdDuration 
        : exhaleDuration;
        
    const calculateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, phaseDuration - elapsed);
      const phaseProgress = (elapsed / phaseDuration) * 100;
      
      setPhaseTimeLeft(Math.ceil(remaining / 1000));
      setProgress(Math.min(phaseProgress, 100));
      
      return elapsed >= phaseDuration;
    };
    
    // Initial progress calculation
    calculateProgress();
    
    // Set up the interval for cycling through phases
    const interval = setInterval(() => {
      if (calculateProgress()) {
        // Move to the next phase
        if (currentPhase === "inhale") {
          currentPhase = "hold";
          phaseDuration = holdDuration;
        } else if (currentPhase === "hold") {
          currentPhase = "exhale";
          phaseDuration = exhaleDuration;
        } else {
          if (onBreathComplete) onBreathComplete();
          currentPhase = "inhale";
          phaseDuration = inhaleDuration;
        }
        setPhase(currentPhase);
        startTime = Date.now();
        setProgress(0);
      }
    }, 16); // 60fps approx
    
    return () => clearInterval(interval);
  }, [isActive, inhaleDuration, holdDuration, exhaleDuration, onBreathComplete, phase]);
  
  const toggleActive = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setPhase("inhale");
      setProgress(0);
      setPhaseTimeLeft(Math.ceil(inhaleDuration / 1000));
    } else {
      setPhase("rest");
    }
  };
  
  const getPhaseColor = () => {
    switch (phase) {
      case "inhale": return "from-blue-500 to-cyan-400";
      case "hold": return "from-amber-400 to-yellow-300";
      case "exhale": return "from-indigo-500 to-blue-400";
      default: return "from-slate-500 to-gray-400";
    }
  };
  
  const getPhaseText = () => {
    switch (phase) {
      case "inhale": return "Adem in";
      case "hold": return "Houd vast";
      case "exhale": return "Adem uit";
      default: return "Start";
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative w-full max-w-xs">
        {phase !== "rest" && (
          <Progress value={progress} className="h-2 mb-6" />
        )}
      </div>
      
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full transition-all",
          {
            "scale-100 opacity-100": phase === "rest" || phase === "exhale",
            "scale-110 opacity-100": phase === "inhale" || phase === "hold",
          },
          className
        )}
        style={{
          transition: `all ${
            phase === "inhale"
              ? inhaleDuration
              : phase === "exhale"
              ? exhaleDuration
              : holdDuration
          }ms ease-in-out`,
        }}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-md opacity-50 bg-gradient-to-r",
            getPhaseColor()
          )}
        />
        <div
          className={cn(
            "h-52 w-52 rounded-full flex items-center justify-center transition-all backdrop-blur-lg border-4",
            {
              "border-blue-500 shadow-lg shadow-blue-500/20": phase === "inhale",
              "border-amber-400 shadow-lg shadow-amber-400/20": phase === "hold",
              "border-indigo-500 shadow-lg shadow-indigo-500/20": phase === "exhale",
              "border-slate-500": phase === "rest",
            }
          )}
        >
          <div className="text-center">
            {phase === "rest" ? (
              <button
                onClick={toggleActive}
                className="flex flex-col items-center justify-center space-y-2 px-6 py-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-primary-foreground hover:from-blue-600 hover:to-cyan-600 transition-colors"
              >
                <Play className="h-8 w-8" />
                <span className="text-lg font-medium">Start</span>
              </button>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="text-2xl font-semibold mb-1">
                  {getPhaseText()}
                </div>
                <div className="flex items-center justify-center text-3xl font-bold">
                  {phaseTimeLeft}
                  <span className="text-sm ml-1 mt-1">s</span>
                </div>
                <button
                  onClick={toggleActive}
                  className="mt-4 flex items-center justify-center space-x-1 px-4 py-2 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
                >
                  <Pause className="h-4 w-4" />
                  <span>Pauzeren</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isActive && (
        <div className="mt-4 text-center flex items-center gap-2 text-sm text-muted-foreground">
          <Timer className="h-4 w-4" />
          <p>
            Adem in ({inhaleDuration / 1000}s) → Houd vast ({holdDuration / 1000}s) →
            Adem uit ({exhaleDuration / 1000}s)
          </p>
        </div>
      )}
    </div>
  );
}
