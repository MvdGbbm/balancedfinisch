
import React from "react";
import { cn } from "@/lib/utils";
import { BreathingPhase } from "./types";
import { getTransitionDuration, getPhaseLabel } from "./breathing-utils";

interface BreathingCircleDisplayProps {
  activePhase: BreathingPhase;
  circleScale: number;
  secondsLeft: number;
  className?: string;
  inhaleDuration: number;
  holdDuration: number;
  exhaleDuration: number;
}

export const BreathingCircleDisplay: React.FC<BreathingCircleDisplayProps> = ({
  activePhase,
  circleScale,
  secondsLeft,
  className,
  inhaleDuration,
  holdDuration,
  exhaleDuration
}) => {
  const transitionDuration = getTransitionDuration(
    activePhase,
    inhaleDuration,
    holdDuration,
    exhaleDuration
  );

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative h-[280px] w-[280px] flex items-center justify-center">
        {/* Simplified breathing circle - single layer with glow */}
        <div 
          className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 blur-xl"
          style={{
            transform: `scale(${circleScale * 1.2})`,
            transition: `transform ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
          }}
        />
        
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
            className="h-full w-full rounded-full flex items-center justify-center bg-cyan-400"
            style={{
              transition: `background ${transitionDuration}ms ease-in-out, 
                          box-shadow ${transitionDuration}ms ease-in-out`
            }}
          >
            <div className="text-center text-white">
              {activePhase === "rest" ? (
                <div className="flex flex-col items-center justify-center space-y-2 px-6 py-4">
                  <span className="text-lg font-medium">Klaar</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-xl font-semibold mb-1">
                    {getPhaseLabel(activePhase)}
                  </div>
                  <div className="flex items-center justify-center text-4xl font-bold">
                    {secondsLeft}
                    <span className="text-sm ml-1 mt-1">s</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
