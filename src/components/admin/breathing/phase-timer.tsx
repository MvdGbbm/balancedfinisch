
import React from "react";
import { Progress } from "@/components/ui/progress";
import { CycleProgress } from "@/components/cycle-progress";
import { PhaseTimerProps } from "./types";

export function PhaseTimer({
  progress,
  currentPhase,
  currentCycle,
  totalCycles,
  secondsLeft,
  pattern
}: PhaseTimerProps) {
  const getInstructions = () => {
    if (!pattern) return "";
    
    switch (currentPhase) {
      case "inhale":
        return pattern.inhaleText || "Inademen";
      case "hold1":
        // Only show hold text if hold duration is greater than 0
        return pattern.hold1 > 0 ? (pattern.hold1Text || "Vasthouden") : "";
      case "exhale":
        return pattern.exhaleText || "Uitademen";
      case "hold2":
        // Only show hold text if hold duration is greater than 0
        return pattern.hold2 > 0 ? (pattern.hold2Text || "Vasthouden") : "";
      default:
        return "";
    }
  };

  return (
    <>
      <Progress value={progress} className="w-64 h-2 mb-2" />
      {getInstructions() && (
        <div className="text-xl font-medium mb-4">{getInstructions()}</div>
      )}
      <CycleProgress 
        currentCycle={currentCycle} 
        totalCycles={totalCycles} 
      />
    </>
  );
}

export default PhaseTimer;
