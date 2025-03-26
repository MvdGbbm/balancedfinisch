import React from "react";
import { cn } from "@/lib/utils";
interface BreathingVisualizationProps {
  phase: "inhale" | "hold" | "exhale" | "rest";
  progress: number;
  secondsLeft: number;
  isActive: boolean;
  cycles?: {
    current: number;
    total: number;
  };
  className?: string;
}
export function BreathingVisualization({
  phase,
  progress,
  secondsLeft,
  isActive,
  cycles,
  className
}: BreathingVisualizationProps) {
  // Map phase to animation parameters
  const getPhaseColors = () => {
    switch (phase) {
      case "inhale":
        return {
          innerGradient: "from-cyan-400 to-blue-500",
          outerGradient: "from-cyan-300/30 to-blue-400/40",
          pulseColor: "bg-cyan-300",
          textColor: "text-cyan-50"
        };
      case "hold":
        return {
          innerGradient: "from-violet-400 to-purple-500",
          outerGradient: "from-violet-300/30 to-purple-400/40",
          pulseColor: "bg-violet-300",
          textColor: "text-violet-50"
        };
      case "exhale":
        return {
          innerGradient: "from-indigo-400 to-blue-500",
          outerGradient: "from-indigo-300/30 to-blue-400/40",
          pulseColor: "bg-indigo-300",
          textColor: "text-indigo-50"
        };
      default:
        return {
          innerGradient: "from-blue-400 to-indigo-500",
          outerGradient: "from-blue-300/30 to-indigo-400/40",
          pulseColor: "bg-blue-300",
          textColor: "text-blue-50"
        };
    }
  };

  // Calculate scale based on phase
  const getScale = () => {
    if (!isActive) return 0.9;
    switch (phase) {
      case "inhale":
        // Scale from 0.9 to 1.5 during inhale
        return 0.9 + progress / 100 * 0.6;
      case "hold":
        // Stay at maximum during hold
        return 1.5;
      case "exhale":
        // Scale from 1.5 back to 0.9 during exhale
        return 1.5 - progress / 100 * 0.6;
      default:
        return 0.9;
    }
  };
  const colors = getPhaseColors();
  const scale = getScale();

  // Get phase instruction text
  const getInstructionText = () => {
    switch (phase) {
      case "inhale":
        return "Adem in";
      case "hold":
        return "Houd vast";
      case "exhale":
        return "Adem uit";
      default:
        return "Rust";
    }
  };
  return <div className={cn("relative flex items-center justify-center", className)}>
      {/* Background animated elements */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-full h-full rounded-full opacity-10 animate-ping-slow" />
        <div className="absolute w-4/5 h-4/5 rounded-full opacity-20 animate-pulse-gentle" />
      </div>
      
      {/* Outer glow ring */}
      <div className={cn("absolute rounded-full blur-xl opacity-60 bg-gradient-to-br", colors.outerGradient)} style={{
      width: `${Math.max(240, 240 * scale * 1.2)}px`,
      height: `${Math.max(240, 240 * scale * 1.2)}px`,
      transition: isActive ? 'all 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'all 0.5s ease-out'
    }} />
      
      {/* Main breathing circle */}
      <div className={cn("relative flex items-center justify-center rounded-full shadow-lg bg-gradient-to-br", colors.innerGradient)} style={{
      width: `${Math.max(200, 200 * scale)}px`,
      height: `${Math.max(200, 200 * scale)}px`,
      transition: isActive ? 'all 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'all 0.5s ease-out'
    }}>
        {/* Decorative particles */}
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white/20 animate-float blur-sm" />
          <div className="absolute bottom-1/4 right-1/3 w-2 h-2 rounded-full bg-white/20 animate-float-delay blur-sm" />
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-white/30 animate-float-longer blur-sm" />
          <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-white/30 animate-float-longer-delay blur-sm" />
        </div>
        
        {/* Circle content */}
        <div className={cn("text-center px-6", colors.textColor)}>
          <p className="text-3xl font-bold mb-1">{secondsLeft}</p>
          <p className="text-lg font-medium mb-1">{getInstructionText()}</p>
          
          {cycles && cycles.total > 1 && <p className="text-xs opacity-80 mt-2">
              Cyclus {cycles.current} van {cycles.total}
            </p>}
        </div>
      </div>
      
      {/* Cycle indicators */}
      {cycles && cycles.total > 1 && <div className="absolute -bottom-8 flex justify-center gap-1.5">
          {Array.from({
        length: cycles.total
      }).map((_, index) => {})}
        </div>}
    </div>;
}