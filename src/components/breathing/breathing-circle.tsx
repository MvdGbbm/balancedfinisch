
import React from "react";
import { cn } from "@/lib/utils";

interface BreathingCircleProps {
  phase: string;
  count: number;
  exerciseCompleted?: boolean;
  currentCycle?: number;
  totalCycles?: number;
  onToggleActive?: () => void;
  phaseLabel?: string;
}

const BreathingCircle: React.FC<BreathingCircleProps> = ({
  phase,
  count,
  exerciseCompleted = false,
  currentCycle = 1,
  totalCycles = 5,
  onToggleActive,
  phaseLabel
}) => {
  // Determine the circle scale based on the phase
  const getCircleScale = () => {
    switch (phase) {
      case 'inhale':
        return 'scale-100';
      case 'hold':
        return 'scale-100';
      case 'exhale':
        return 'scale-75';
      default:
        return 'scale-75';
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center my-8">
      {/* Cycle indicator */}
      <div className="text-center mb-2 text-sm text-blue-200">
        Cyclus {currentCycle} van {totalCycles} | Nog {count} seconden
      </div>

      {/* Breathing circle */}
      <div 
        className={cn(
          "relative h-64 w-64 rounded-full bg-blue-50 border-4 border-blue-400 flex items-center justify-center transition-transform",
          getCircleScale(),
          exerciseCompleted && "bg-green-50 border-green-400"
        )}
        style={{ 
          transition: "transform 0.5s ease-in-out",
          boxShadow: "0 0 30px rgba(96, 165, 250, 0.5)"
        }}
        onClick={onToggleActive}
      >
        <div className="text-blue-800 text-xl font-medium">
          {exerciseCompleted ? "Voltooid!" : phaseLabel || phase}
        </div>
      </div>
    </div>
  );
};

export default BreathingCircle;
