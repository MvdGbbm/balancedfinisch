
import React from "react";
import { cn } from "@/lib/utils";
import { BreathingCircleProps } from "../core/types";
import { getPhaseLabel } from "../core/breathing-utils";

export const BreathingCircle: React.FC<BreathingCircleProps> = ({
  state,
  settings,
  onPhaseChange
}) => {
  const { 
    isActive, 
    currentPhase, 
    circleScale, 
    secondsLeft 
  } = state;
  
  const { 
    inhaleDuration, 
    holdDuration, 
    exhaleDuration, 
    animationStyle = "grow",
    animationColor = "cyan", 
    animated = true,
    circleSize = "medium",
    textSize = "medium"
  } = settings;

  // Get circle size class
  const getCircleSizeClass = () => {
    switch (circleSize) {
      case "small": return "h-[220px] w-[220px]";
      case "large": return "h-[360px] w-[360px]";
      case "medium":
      default: return "h-[280px] w-[280px]";
    }
  };

  // Get text size class
  const getTextSizeClass = () => {
    switch (textSize) {
      case "small": return "text-lg";
      case "large": return "text-3xl";
      case "medium":
      default: return "text-2xl";
    }
  };

  // Get transition duration based on phase
  const getTransitionDuration = () => {
    switch (currentPhase) {
      case "inhale": return `${inhaleDuration}s`;
      case "hold": return `${holdDuration}s`;
      case "exhale": return `${exhaleDuration}s`;
      default: return "1s";
    }
  };

  // Get animation classes based on settings
  const getAnimationClasses = () => {
    if (!animated) {
      return `bg-${animationColor}-400/10 border-2 border-${animationColor}-400/20`;
    }
    
    switch (animationStyle) {
      case "glow":
        return `bg-${animationColor}-400/10 border-2 border-${animationColor}-400/30 shadow-lg shadow-${animationColor}-400/20`;
      case "pulse":
        return `bg-${animationColor}-400/10 border-2 border-${animationColor}-400/30 animate-pulse`;
      case "fade":
        return `bg-${animationColor}-400/10 border-2 border-${animationColor}-400/30 transition-opacity`;
      case "grow":
      default:
        return `bg-${animationColor}-400/10 border-2 border-${animationColor}-400/20`;
    }
  };

  // Get label for current phase
  const phaseLabel = getPhaseLabel(currentPhase);

  // Skip hold label if duration is 0
  const shouldShowLabel = !(
    (currentPhase === "hold" && holdDuration <= 0)
  );

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className={cn("relative flex items-center justify-center", getCircleSizeClass())}>
        {/* Background glow effect */}
        <div 
          className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 blur-xl"
          style={{
            transform: `scale(${circleScale * 1.2})`,
            transition: `transform ${getTransitionDuration()} cubic-bezier(0.4, 0, 0.2, 1)`
          }}
        />
        
        {/* Main circle */}
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full",
            getAnimationClasses()
          )}
          style={{
            transform: `scale(${circleScale})`,
            transition: `transform ${getTransitionDuration()} cubic-bezier(0.4, 0, 0.2, 1)`
          }}
        >
          {/* Inner content */}
          <div className="h-full w-full rounded-full flex items-center justify-center">
            <div className="text-center text-white">
              {currentPhase === "rest" ? (
                <div className="flex flex-col items-center justify-center space-y-2 px-6 py-4">
                  <span className="text-lg font-medium">Voltooid</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  {shouldShowLabel && (
                    <div className={cn("font-semibold mb-1", getTextSizeClass())}>
                      {phaseLabel}
                    </div>
                  )}
                  {secondsLeft > 0 && (
                    <div className="flex items-center justify-center text-4xl font-bold">
                      {secondsLeft}
                      <span className="text-sm ml-1 mt-1">s</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
