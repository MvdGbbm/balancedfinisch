
import React, { memo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { BreathingCircleVisualProps } from "./types";

export const BreathingCircleVisual = memo(({ 
  circleScale, 
  transitionDuration, 
  className,
  children
}: BreathingCircleVisualProps) => {
  // Debug animation properties
  useEffect(() => {
    console.log("Circle animation properties:", { 
      circleScale, 
      transitionDuration 
    });
  }, [circleScale, transitionDuration]);

  // Use CSS custom properties for better performance
  const styleProperties = {
    "--circle-scale": circleScale,
    "--transition-duration": `${transitionDuration}ms`,
  } as React.CSSProperties;

  return (
    <>
      {/* Outer glow effect - optimized to use transform instead of scaling width/height */}
      <div 
        className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 blur-xl transform-gpu"
        style={{
          transform: `scale(${circleScale * 1.2})`,
          transition: `transform ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          animation: circleScale > 0.5 ? 'pulse 2s infinite' : 'none'
        }}
      />
      
      {/* Main circle - using transform-gpu for hardware acceleration */}
      <div 
        className={cn(
          "absolute inset-0 flex items-center justify-center rounded-full transform-gpu", 
          className
        )}
        style={{
          transform: `scale(${circleScale})`,
          transition: `transform ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
        }}
      >
        <div 
          className="h-full w-full rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg will-change-transform"
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
});

// Add display name for debugging
BreathingCircleVisual.displayName = "BreathingCircleVisual";
