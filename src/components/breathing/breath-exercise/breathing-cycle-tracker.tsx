
import React from "react";
import { BreathingCycleTrackerProps } from "./types";

export function BreathingCycleTracker({
  currentCycle,
  totalCycles
}: BreathingCycleTrackerProps) {
  return (
    <div className="text-center space-y-1 text-white mt-4">
      <p className="text-sm text-white/70">
        Cyclus {currentCycle} van {totalCycles}
      </p>
    </div>
  );
}
