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
  return <>
      
      
      <Progress value={progress} className="h-2 mb-2" />
    </>;
}