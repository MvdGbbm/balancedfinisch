
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
  animationEnabled?: boolean;
  animationStyle?: "grow" | "glow" | "pulse" | "fade" | "none";
  animationColor?: string;
}

export const BreathingCircleDisplay: React.FC<BreathingCircleDisplayProps> = ({
  activePhase,
  circleScale,
  secondsLeft,
  className,
  inhaleDuration,
  holdDuration,
  exhaleDuration,
  animationEnabled = true,
  animationStyle = "grow",
  animationColor = "#00b8d9"
}) => {
  const transitionDuration = getTransitionDuration(
    activePhase,
    inhaleDuration,
    holdDuration,
    exhaleDuration
  );

  const getCircleStyles = () => {
    // Default styles if animation is disabled
    if (!animationEnabled || animationStyle === "none") {
      return {
        backgroundColor: animationColor,
        transform: "scale(1)",
        transition: "none"
      };
    }

    // Animation enabled - apply styles based on selected animation type
    const baseStyles = {
      backgroundColor: animationColor,
      transition: `transform ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1), 
                  background ${transitionDuration}ms ease-in-out, 
                  box-shadow ${transitionDuration}ms ease-in-out,
                  opacity ${transitionDuration}ms ease-in-out`
    };

    if (animationStyle === "grow") {
      return {
        ...baseStyles,
        transform: `scale(${circleScale})`
      };
    } else if (animationStyle === "glow") {
      return {
        ...baseStyles,
        transform: `scale(${circleScale * 0.9 + 0.1})`,
        boxShadow: `0 0 ${30 * circleScale}px ${animationColor}`
      };
    } else if (animationStyle === "pulse") {
      return {
        ...baseStyles,
        transform: `scale(${circleScale * 0.85 + 0.15})`,
        animation: activePhase !== "rest" ? `pulse ${transitionDuration / 1000}s infinite alternate` : "none"
      };
    } else if (animationStyle === "fade") {
      return {
        ...baseStyles,
        transform: "scale(1)",
        opacity: activePhase === "inhale" ? 1 : activePhase === "exhale" ? 0.5 : 0.75
      };
    }

    // Fallback
    return baseStyles;
  };

  const getGlowStyles = () => {
    if (!animationEnabled || animationStyle !== "glow") {
      return { opacity: 0 };
    }
    
    return {
      opacity: 0.3 * circleScale,
      transform: `scale(${circleScale * 1.2})`,
      background: animationColor,
      transition: `transform ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${transitionDuration}ms ease-in-out`
    };
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative h-[280px] w-[280px] flex items-center justify-center">
        {/* Glow layer */}
        <div 
          className="absolute inset-0 rounded-full opacity-20 blur-xl"
          style={getGlowStyles()}
        />
        
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full", 
            className
          )}
        >
          <div 
            className="h-full w-full rounded-full flex items-center justify-center"
            style={getCircleStyles()}
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
