
import React from "react";
import { Progress } from "@/components/ui/progress";
import { BreathingPhase } from "./types";

interface BreathingPhaseDisplayProps {
  currentPhase: BreathingPhase;
  currentCycle: number;
  totalCycles: number;
  secondsLeft: number;
  progress?: number;
}

export function BreathingPhaseDisplay({ 
  currentPhase, 
  currentCycle, 
  totalCycles, 
  secondsLeft,
  progress = 0
}: BreathingPhaseDisplayProps) {
  const getInstructions = () => {
    switch (currentPhase) {
      case "inhale":
        return "Inademen";
      case "hold1":
      case "hold2":
        return "Vasthouden";
      case "exhale":
        return "Uitademen";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">{getInstructions()}</h3>
          <p className="text-sm text-muted-foreground">
            Cyclus {currentCycle} van {totalCycles}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-mono">{secondsLeft}s</span>
        </div>
      </div>
      
      <Progress value={progress} className="h-2 mb-2" />
    </>
  );
}
