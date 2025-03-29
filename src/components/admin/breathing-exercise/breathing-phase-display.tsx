
import React from "react";
import { Progress } from "@/components/ui/progress";
import { BreathingPhase } from "./types";
import { BreathingPattern } from "@/lib/types";

interface BreathingPhaseDisplayProps {
  currentPhase: BreathingPhase;
  currentCycle: number;
  totalCycles: number;
  secondsLeft: number;
  progress?: number;
  holdEnabled?: boolean;
  pattern?: BreathingPattern | null;
}

export function BreathingPhaseDisplay({
  currentPhase,
  currentCycle,
  totalCycles,
  secondsLeft,
  progress = 0,
  holdEnabled = true,
  pattern
}: BreathingPhaseDisplayProps) {
  const getInstructions = () => {
    if (!holdEnabled && (currentPhase === "hold1" || currentPhase === "hold2")) {
      // Skip hold phase text if holdEnabled is false
      return currentPhase === "hold1" ? 
        (pattern?.inhaleText || "Inademen") : 
        (pattern?.exhaleText || "Uitademen");
    }
    
    switch (currentPhase) {
      case "inhale":
        return pattern?.inhaleText || "Inademen";
      case "hold1":
        return pattern?.hold1Text || "Vasthouden";
      case "exhale":
        return pattern?.exhaleText || "Uitademen";
      case "hold2":
        return pattern?.hold2Text || "Vasthouden";
      default:
        return "";
    }
  };
  
  return (
    <>
      <div className="text-center mb-2">
        <div className="text-lg font-semibold mb-1">{getInstructions()}</div>
        <div className="text-sm text-muted-foreground">
          Cyclus {currentCycle} van {totalCycles} | Nog {secondsLeft} seconden
        </div>
      </div>
      
      <Progress value={progress} className="h-2 mb-2" />
    </>
  );
}
