
import React from "react";
import { cn } from "@/lib/utils";
import { BreathingCircleVisualProps } from "./types";

export function BreathingCircleVisual({ 
  className,
  children
}: BreathingCircleVisualProps) {
  return (
    <div 
      className={cn(
        "absolute inset-0 flex items-center justify-center rounded-full", 
        className
      )}
    >
      <div 
        className="h-full w-full rounded-full flex items-center justify-center bg-cyan-400"
      >
        <div className="text-center text-white">
          {children}
        </div>
      </div>
    </div>
  );
}
