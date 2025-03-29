
import React, { memo } from "react";
import { BreathingCircleProps } from "./types";
import { BreathingCircleVisual } from "./breathing-circle-visual";
import { BreathingPhaseDisplay } from "./breathing-phase-display";
import { useBreathingAnimation } from "./use-breathing-animation";

// Using memo to prevent unnecessary re-renders
export const BreathingCircle = memo(({
  inhaleDuration = 4000,
  holdDuration = 2000,
  exhaleDuration = 6000,
  className,
  onBreathComplete,
  isActive = false,
  currentPhase = "rest",
  secondsLeft = 0,
  holdEnabled = true
}: BreathingCircleProps) => {
  const { 
    phase, 
    phaseTimeLeft, 
    progress, 
    circleScale, 
    getTransitionDuration 
  } = useBreathingAnimation({
    inhaleDuration,
    holdDuration,
    exhaleDuration,
    isActive,
    currentPhase,
    secondsLeft,
    onBreathComplete
  });

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative h-[280px] w-[280px] flex items-center justify-center">
        <BreathingCircleVisual 
          circleScale={circleScale}
          transitionDuration={getTransitionDuration()}
          className={className}
        >
          <BreathingPhaseDisplay 
            activePhase={phase} 
            phaseTimeLeft={phaseTimeLeft} 
          />
        </BreathingCircleVisual>
      </div>
    </div>
  );
});

// Add display name for debugging
BreathingCircle.displayName = "BreathingCircle";

// Make sure to export as default for components that import it that way
export default BreathingCircle;
