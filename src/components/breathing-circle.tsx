
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BreathingCircleProps {
  duration?: number;
  inhaleDuration?: number;
  holdDuration?: number;
  exhaleDuration?: number;
  className?: string;
  onBreathComplete?: () => void;
}

export function BreathingCircle({
  duration = 5000,
  inhaleDuration = 4000,
  holdDuration = 2000,
  exhaleDuration = 6000,
  className,
  onBreathComplete,
}: BreathingCircleProps) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("rest");
  const [isActive, setIsActive] = useState(false);
  
  // Breathing cycle
  useEffect(() => {
    if (!isActive) return;
    
    const totalCycleDuration = inhaleDuration + holdDuration + exhaleDuration;
    
    // Start with inhale
    setPhase("inhale");
    
    // Set up the interval for cycling through phases
    const inhaleTimeout = setTimeout(() => {
      setPhase("hold");
      
      const holdTimeout = setTimeout(() => {
        setPhase("exhale");
        
        const exhaleTimeout = setTimeout(() => {
          if (onBreathComplete) onBreathComplete();
          setPhase("inhale");
        }, exhaleDuration);
        
        return () => clearTimeout(exhaleTimeout);
      }, holdDuration);
      
      return () => clearTimeout(holdTimeout);
    }, inhaleDuration);
    
    return () => clearTimeout(inhaleTimeout);
  }, [isActive, inhaleDuration, holdDuration, exhaleDuration, onBreathComplete, phase]);
  
  const toggleActive = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setPhase("inhale");
    } else {
      setPhase("rest");
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full transition-all duration-500",
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
            "absolute inset-0 rounded-full blur-md opacity-30",
            {
              "bg-primary": phase === "inhale",
              "bg-amber-400": phase === "hold",
              "bg-blue-400": phase === "exhale",
              "bg-muted": phase === "rest",
            }
          )}
        />
        <div
          className={cn(
            "h-40 w-40 rounded-full flex items-center justify-center transition-all glass-morphism backdrop-blur-lg border-2",
            {
              "border-primary": phase === "inhale",
              "border-amber-400": phase === "hold",
              "border-blue-400": phase === "exhale",
              "border-muted": phase === "rest",
            }
          )}
        >
          <div className="text-center">
            {phase === "rest" ? (
              <button
                onClick={toggleActive}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Start
              </button>
            ) : (
              <>
                <div className="text-sm mb-1 font-medium">
                  {phase === "inhale"
                    ? "Adem in"
                    : phase === "hold"
                    ? "Houd vast"
                    : "Adem uit"}
                </div>
                <button
                  onClick={toggleActive}
                  className="text-xs px-2 py-1 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
                >
                  Pauzeren
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {isActive && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>
            Adem in ({inhaleDuration / 1000}s) → Houd vast ({holdDuration / 1000}s) →
            Adem uit ({exhaleDuration / 1000}s)
          </p>
        </div>
      )}
    </div>
  );
}
