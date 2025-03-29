
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
          transition: `transform ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
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
          transition: `transform ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
        }}
      >
        <div 
          className="h-full w-full rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg"
          style={{
            transition: `background ${transitionDuration}ms ease-in-out, 
                        box-shadow ${transitionDuration}ms ease-in-out`
          }}
        >
          <div className="text-center">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
