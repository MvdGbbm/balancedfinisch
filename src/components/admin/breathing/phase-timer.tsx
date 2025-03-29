
import React from "react";
import { Progress } from "@/components/ui/progress";
import { CycleProgress } from "@/components/cycle-progress";

interface PhaseTimerProps {
  progress: number;
  currentPhase: "inhale" | "hold1" | "exhale" | "hold2";
  currentCycle: number;
  totalCycles: number;
  secondsLeft: number;
  isActive?: boolean;
}

export function PhaseTimer({
  progress,
  currentPhase,
  currentCycle,
  totalCycles,
  secondsLeft,
  isActive
}: PhaseTimerProps) {
  const getInstructions = () => {
    switch (currentPhase) {
      case "inhale":
        return "Inademen";
      case "hold1":
        return "Vasthouden";
      case "exhale":
        return "Uitademen";
      case "hold2":
        return "Vasthouden";
      default:
        return "";
    }
  };

  return (
    <>
      <Progress value={progress} className="w-64 h-2 mb-2" />
      <div className="text-xl font-medium mb-4">{getInstructions()}</div>
      <CycleProgress 
        currentCycle={currentCycle} 
        totalCycles={totalCycles} 
      />
    </>
  );
}

export default PhaseTimer;
