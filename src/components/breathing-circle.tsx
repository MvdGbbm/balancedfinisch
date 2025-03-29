
import React from "react";
import { cn } from "@/lib/utils";
import { BreathingCircleProps } from "./breathing/core/types";
import { useBreathingState } from "./breathing/core/use-breathing-state";
import { BreathingCircleDisplay } from "./breathing/core/breathing-circle-display";

export function BreathingCircle({
  inhaleDuration = 4000,
  holdDuration = 2000,
  exhaleDuration = 6000,
  className,
  onBreathComplete,
  isActive = false,
  currentPhase = "rest",
  secondsLeft = 0,
  animationEnabled = true,
  animationStyle = "grow",
  animationColor = "#00b8d9"
}: BreathingCircleProps) {
  const breathingState = useBreathingState({
    isActive,
    inhaleDuration,
    holdDuration,
    exhaleDuration,
    onBreathComplete,
    currentPhaseFromParent: currentPhase,
    secondsLeftFromParent: secondsLeft
  });

  return (
    <BreathingCircleDisplay
      activePhase={breathingState.activePhase}
      circleScale={breathingState.circleScale}
      secondsLeft={breathingState.secondsLeft}
      className={className}
      inhaleDuration={inhaleDuration}
      holdDuration={holdDuration}
      exhaleDuration={exhaleDuration}
      animationEnabled={animationEnabled}
      animationStyle={animationStyle}
      animationColor={animationColor}
    />
  );
}
