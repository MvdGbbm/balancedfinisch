
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
  
  return (
    <div className="flex justify-center my-8">
      <div className="relative h-64 w-64 flex items-center justify-center">
        {/* Background glow effect */}
        <div 
          className="absolute inset-0 rounded-full bg-blue-300 opacity-20 blur-lg"
          style={{
            transform: `scale(${circleScale * 1.2})`,
            transition: 'transform 1s ease-in-out'
          }}
        />
        
        {/* Main breathing circle */}
        <div 
          className="absolute inset-0 rounded-full border-4 border-blue-400 bg-gradient-to-br from-blue-100 to-blue-200"
          style={{
            transform: `scale(${circleScale})`,
            transition: 'transform 1s ease-in-out'
          }}
        >
          <div className="flex flex-col items-center justify-center h-full w-full text-blue-900">
            <span className="text-xl font-medium">{getInstructions()}</span>
            {isActive && (
              <span className="text-sm mt-2">
                {Math.round(progress)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
