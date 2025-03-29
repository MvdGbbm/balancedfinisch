
import React from "react";

interface CycleProgressProps {
  currentCycle: number;
  totalCycles: number;
}

export function CycleProgress({ currentCycle, totalCycles }: CycleProgressProps) {
  return (
    <div className="text-center space-y-1 text-white mt-4">
      <p className="text-sm text-white/70">
        Cyclus {currentCycle} van {totalCycles}
      </p>
    </div>
  );
}
