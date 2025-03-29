
import React from "react";
import { cn } from "@/lib/utils";
import { BreathingCircleVisualProps } from "./types";

export function BreathingCircleVisual({ 
  circleScale, 
  transitionDuration, 
  className,
  children
}: BreathingCircleVisualProps) {
  return (
    <>
      {/* Outer glow effect */}
      <div 
        className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 blur-xl"
        style={{
          transform: `scale(${circleScale * 1.2})`,
          transition: `transform 0.5s ease-in-out`
        }}
      />
      
      {/* Main circle */}
      <div 
        className={cn(
          "absolute inset-0 flex items-center justify-center rounded-full", 
          className
        )}
        style={{
          transform: `scale(${circleScale})`,
          transition: `transform 0.5s ease-in-out`
        }}
      >
        <div 
          className="h-full w-full rounded-full flex items-center justify-center bg-cyan-400"
          style={{
            transition: `background 0.5s ease-in-out, 
                        box-shadow 0.5s ease-in-out`
          }}
        >
          <div className="text-center text-white">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
