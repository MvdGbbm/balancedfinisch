
import React from "react";
import { Progress } from "@/components/ui/progress";
import { BreathingPhase } from "./types";
interface BreathingPhaseDisplayProps {
  currentPhase: BreathingPhase;
  currentCycle: number;
  totalCycles: number;
  secondsLeft: number;
  progress?: number;
  holdEnabled?: boolean;
}
export function BreathingPhaseDisplay({
  currentPhase,
  currentCycle,
  totalCycles,
  secondsLeft,
  progress = 0,
  holdEnabled = true
}: BreathingPhaseDisplayProps) {
  const getInstructions = () => {
    switch (currentPhase) {
      case "inhale":
        return "Inademen";
      case "hold1":
      case "hold2":
        // Only show "Vasthouden" if hold is enabled
        return holdEnabled ? "Vasthouden" : "Inademen";
      case "exhale":
        return "Uitademen";
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
