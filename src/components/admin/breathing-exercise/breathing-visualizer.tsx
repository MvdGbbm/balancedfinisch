
import React from "react";
import { BreathingPhase } from "./types";

interface BreathingVisualizerProps {
  circleScale: number;
  isActive: boolean;
  currentPhase: BreathingPhase;
  progress: number;
}

export function BreathingVisualizer({ 
  circleScale, 
  isActive, 
  currentPhase
}: BreathingVisualizerProps) {
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
    <div className="flex justify-center my-8">
      <div 
        className="w-40 h-40 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center transition-all duration-1000"
        style={{ 
          transform: `scale(${circleScale})`,
          opacity: isActive ? 1 : 0.5,
        }}
      >
        <div className="text-center">
          <p className="text-lg font-semibold text-primary">
            {!isActive ? "Start" : getInstructions()}
          </p>
        </div>
      </div>
    </div>
  );
}
