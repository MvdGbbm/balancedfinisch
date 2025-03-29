
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
  
  // Calculate colors based on the current phase
  const getGradientColors = () => {
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
        {/* Background glow effect */}
        <div 
          className={`absolute inset-0 rounded-full opacity-30 blur-xl ${
            currentPhase === "inhale" ? "bg-blue-300" : 
            (currentPhase === "hold1" || currentPhase === "hold2") ? "bg-purple-300" : 
            "bg-teal-300"
          }`}
          style={{
            transform: `scale(${circleScale * 1.3})`,
            transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
        
        {/* Pulsing effect for "breathing" feel */}
        <div 
          className={`absolute inset-0 rounded-full opacity-20 ${
            currentPhase === "inhale" ? "bg-blue-400" : 
            (currentPhase === "hold1" || currentPhase === "hold2") ? "bg-purple-400" : 
            "bg-teal-400"
          }`}
          style={{
            transform: `scale(${circleScale * 1.1})`,
            transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: isActive && currentPhase !== "hold1" && currentPhase !== "hold2" ? 'pulse 2s infinite' : 'none'
          }}
        />
        
        {/* Main breathing circle */}
        <div 
          className={`absolute inset-0 rounded-full border-4 ${getBorderColor()} bg-gradient-to-br ${getGradientColors()}`}
          style={{
            transform: `scale(${circleScale})`,
            transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.5s ease'
          }}
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
