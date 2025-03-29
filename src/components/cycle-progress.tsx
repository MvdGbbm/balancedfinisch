
import React from "react";
import { cn } from "@/lib/utils";

interface CycleProgressProps {
  currentCycle: number;
  totalCycles: number;
}

export function CycleProgress({ currentCycle, totalCycles }: CycleProgressProps) {
  // Calculate progress percentage
  const progressPercentage = (currentCycle / totalCycles) * 100;
  
  return (
    <div className="text-center space-y-2 text-white mt-4">
      <p className="text-sm text-white/70">
        Cyclus {currentCycle} van {totalCycles}
      </p>
      
      {/* Progress bar */}
      <div className="w-full bg-white/10 rounded-full h-1.5">
        <div 
          className="h-1.5 rounded-full bg-white/70 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
