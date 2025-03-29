
import React from "react";

interface CircleAnimationProps {
  isActive: boolean;
  currentPhase: "inhale" | "hold1" | "exhale" | "hold2";
  circleScale: number;
  setCircleScale?: (scale: number) => void;
  secondsLeft?: number;
}

export function CircleAnimation({
  isActive,
  currentPhase,
  circleScale,
  secondsLeft,
  setCircleScale
}: CircleAnimationProps) {
  return (
    <div 
      className="bg-primary/10 border-2 border-primary/20 rounded-full p-10 mb-4 relative" 
      style={{ 
        transform: `scale(${circleScale})`,
        transition: 'transform 0.5s ease-in-out'
      }}
    >
      <div className="text-2xl font-bold text-primary">{secondsLeft}</div>
    </div>
  );
}

export default CircleAnimation;
