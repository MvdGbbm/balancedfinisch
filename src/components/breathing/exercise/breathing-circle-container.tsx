
import React from "react";
import { BreathingCircle } from "@/components/breathing-circle";
import { BreathingPhase } from "../core/types";

interface BreathingCircleContainerProps {
  isActive: boolean;
  currentPhase: "inhale" | "hold1" | "exhale" | "hold2";
  secondsLeft: number;
  selectedPattern: {
    inhale: number;
    hold1: number;
    exhale: number;
  };
  currentCycle: number;
  totalCycles: number;
}

export function BreathingCircleContainer({
  isActive,
  currentPhase,
  secondsLeft,
  selectedPattern,
  currentCycle,
  totalCycles
}: BreathingCircleContainerProps) {
  // Maps breathing phases to circle component phases
  const mapPhaseToCirclePhase = (phase: "inhale" | "hold1" | "exhale" | "hold2"): "inhale" | "hold" | "exhale" | "rest" => {
    switch (phase) {
      case "inhale": return "inhale";
      case "hold1": return "hold";
      case "exhale": return "exhale";
      case "hold2": return "hold";
      default: return "rest";
    }
  };

  return (
    <>
      <BreathingCircle
        isActive={isActive}
        currentPhase={mapPhaseToCirclePhase(currentPhase)}
        secondsLeft={secondsLeft}
        inhaleDuration={selectedPattern.inhale * 1000}
        holdDuration={selectedPattern.hold1 * 1000}
        exhaleDuration={selectedPattern.exhale * 1000}
      />
      
      <div className="text-center space-y-1 text-white mt-4">
        <p className="text-sm text-white/70">
          Cyclus {currentCycle} van {totalCycles}
        </p>
      </div>
    </>
  );
}
