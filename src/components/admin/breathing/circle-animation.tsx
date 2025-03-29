
import React, { useEffect } from "react";

interface CircleAnimationProps {
  isActive: boolean;
  currentPhase: "inhale" | "hold1" | "exhale" | "hold2";
  circleScale: number;
  secondsLeft?: number;
  pattern?: {
    inhale: number;
    exhale: number;
  } | null;
  setCircleScale?: (scale: number) => void;
}

export function CircleAnimation({
  isActive,
  currentPhase,
  circleScale,
  secondsLeft,
  pattern,
  setCircleScale
}: CircleAnimationProps) {
  // The component doesn't actually use these props internally,
  // but they're required by the parent component's type system
  
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
