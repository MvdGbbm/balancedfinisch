
import React, { useEffect } from "react";
import { CircleAnimationProps } from "./types";

export function CircleAnimation({
  isActive,
  currentPhase,
  secondsLeft,
  pattern,
  circleScale,
  setCircleScale
}: CircleAnimationProps) {
  // Handle circle scaling based on breathing phase
  useEffect(() => {
    if (!isActive || !pattern) return;
    
    if (currentPhase === "inhale") {
      const inhaleProgress = (pattern.inhale - secondsLeft) / pattern.inhale;
      setCircleScale(1 + inhaleProgress * 0.5);
    } else if (currentPhase === "exhale") {
      const exhaleProgress = (pattern.exhale - secondsLeft) / pattern.exhale;
      setCircleScale(1.5 - exhaleProgress * 0.5);
    }
  }, [currentPhase, secondsLeft, isActive, pattern]);

  // Get text for the current phase
  const getPhaseText = () => {
    if (!pattern) return "";
    
    switch (currentPhase) {
      case "inhale":
        return pattern.inhaleText || "Adem in";
      case "hold1":
        return pattern.hold1Text || "Vasthouden";
      case "exhale":
        return pattern.exhaleText || "Adem uit";
      case "hold2":
        return pattern.hold2Text || "Vasthouden";
      default:
        return "";
    }
  };

  // Get animation style classes based on pattern configuration
  const getAnimationClasses = () => {
    if (!pattern || !pattern.animationEnabled) {
      return "bg-primary/10 border-2 border-primary/20";
    }
    
    const style = pattern.animationStyle || "grow";
    const color = pattern.animationColor || "primary";
    
    switch (style) {
      case "glow":
        return `bg-${color}/10 border-2 border-${color}/30 shadow-lg shadow-${color}/20`;
      case "pulse":
        return `bg-${color}/10 border-2 border-${color}/30 animate-pulse`;
      case "fade":
        return `bg-${color}/10 border-2 border-${color}/30 transition-opacity`;
      case "none":
        return `bg-${color}/10 border-2 border-${color}/30`;
      case "grow":
      default:
        return `bg-${color}/10 border-2 border-${color}/20`;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mb-4">
      <div 
        className={`rounded-full p-12 mb-2 flex items-center justify-center relative ${getAnimationClasses()}`}
        style={{ 
          transform: `scale(${circleScale})`,
          transition: 'transform 0.5s ease-in-out'
        }}
      >
        <div className="text-xl font-bold text-center">
          <div>{getPhaseText()}</div>
          <div className="text-2xl mt-1">{secondsLeft}</div>
        </div>
      </div>
    </div>
  );
}

export default CircleAnimation;
