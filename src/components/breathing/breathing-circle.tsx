
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
  // Static styling based on phase without animations
  const getCircleClass = () => {
    switch (phase) {
      case 'inhale':
        return 'bg-blue-50 border-blue-400';
      case 'hold':
        return 'bg-purple-50 border-purple-400';
      case 'exhale':
        return 'bg-teal-50 border-teal-400';
      default:
        return 'bg-blue-50 border-blue-400';
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center my-8">
      {/* Cycle indicator */}
      <div className="text-center mb-2 text-sm text-blue-200">
        Cyclus {currentCycle} van {totalCycles} | Nog {count} seconden
      </div>

      {/* Breathing circle without animations */}
      <div 
        className={cn(
          "relative h-64 w-64 rounded-full border-4 flex items-center justify-center",
          getCircleClass(),
          exerciseCompleted && "bg-green-50 border-green-400"
        )}
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
