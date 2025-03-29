import React from "react";
import { BreathingPhase } from "./types";
interface BreathingVisualizerProps {
  circleScale: number;
  isActive: boolean;
  currentPhase: BreathingPhase;
  progress: number;
  holdEnabled?: boolean;
}
export function BreathingVisualizer({
  circleScale,
  isActive,
  currentPhase,
  holdEnabled = true
}: BreathingVisualizerProps) {
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
  return <div className="flex justify-center my-8">
      
    </div>;
}