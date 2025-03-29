
import React from "react";
import { BreathingPhaseDisplayProps } from "./types";

export function BreathingPhaseDisplay({ 
  activePhase, 
  phaseTimeLeft 
}: BreathingPhaseDisplayProps) {
  const getPhaseText = () => {
    switch (activePhase) {
      case "inhale": return "Adem in";
      case "hold": return "Houd vast";
      case "exhale": return "Adem uit";
      case "rest": return "Klaar";
      default: return "";
    }
  };

  if (activePhase === "rest") {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 px-6 py-4">
        <span className="text-lg font-medium">Klaar</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-xl font-semibold mb-1">
        {getPhaseText()}
      </div>
      <div className="flex items-center justify-center text-4xl font-bold">
        {phaseTimeLeft}
        <span className="text-sm ml-1 mt-1">s</span>
      </div>
    </div>
  );
}
