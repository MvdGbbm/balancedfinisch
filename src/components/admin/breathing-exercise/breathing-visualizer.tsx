
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
  isActive,
  currentPhase,
  progress,
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
  
  // Calculate colors based on the current phase
  const getGradientColors = () => {
    // If it's hold1/hold2 phase but hold is disabled, treat it as inhale phase
    if ((currentPhase === "hold1" || currentPhase === "hold2") && !holdEnabled) {
      return "from-blue-100 to-blue-300";
    }
    
    switch (currentPhase) {
      case "inhale":
        return "from-blue-100 to-blue-300";
      case "hold1":
      case "hold2":
        return "from-purple-100 to-purple-300";
      case "exhale":
        return "from-teal-100 to-teal-300";
      default:
        return "from-blue-100 to-blue-200";
    }
  };

  // Calculate border color based on the current phase
  const getBorderColor = () => {
    // If it's hold1/hold2 phase but hold is disabled, treat it as inhale phase
    if ((currentPhase === "hold1" || currentPhase === "hold2") && !holdEnabled) {
      return "border-blue-500";
    }
    
    switch (currentPhase) {
      case "inhale":
        return "border-blue-500";
      case "hold1":
      case "hold2":
        return "border-purple-500";
      case "exhale":
        return "border-teal-500";
      default:
        return "border-blue-400";
    }
  };
  
  return (
    <div className="flex justify-center my-8">
      <div className="relative h-64 w-64 flex items-center justify-center">
        {/* Main breathing circle without animations */}
        <div 
          className={`absolute inset-0 rounded-full border-4 ${getBorderColor()} bg-gradient-to-br ${getGradientColors()}`}
        >
          <div className="flex flex-col items-center justify-center h-full w-full text-blue-900">
            <span className="text-2xl font-medium">{getInstructions()}</span>
            {isActive && (
              <span className="text-sm mt-2 font-semibold bg-white bg-opacity-50 px-3 py-1 rounded-full">
                {Math.round(progress)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
