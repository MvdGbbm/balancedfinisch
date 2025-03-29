
import React, { useEffect } from "react";

interface CircleAnimationProps {
  isActive: boolean;
  currentPhase: "inhale" | "hold1" | "exhale" | "hold2";
  secondsLeft: number;
  pattern: {
    inhale: number;
    exhale: number;
  } | null;
  circleScale: number;
  setCircleScale: (scale: number) => void;
}

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
