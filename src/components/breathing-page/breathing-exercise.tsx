
import React from "react";
import BreathingAnimation from "@/components/breathing/breathing-animation";
import { BreathingPhase } from "@/components/breathing/types";
import { PatternSelector } from "@/components/breathing-page/pattern-selector";
import { BreathingPattern } from "@/components/breathing-page/types";

interface BreathingExerciseProps {
  breathingPatterns: BreathingPattern[];
  selectedPattern: BreathingPattern | null;
  isExerciseActive: boolean;
  showAnimation: boolean;
  currentCycle: number;
  exerciseCompleted: boolean;
  currentPhase: BreathingPhase | "hold1" | "hold2"; // Allow for both types of phase naming
  onSelectPattern: (patternId: string) => void;
  onPhaseChange: (phase: BreathingPhase) => void;
}

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({
  breathingPatterns,
  selectedPattern,
  isExerciseActive,
  showAnimation,
  currentCycle,
  exerciseCompleted,
  currentPhase,
  onSelectPattern,
  onPhaseChange
}) => {
  // Map the breathing phase from the current phase type to the animation component's expected type
  const mapToAnimationPhase = (phase: string): BreathingPhase => {
    if (phase === "inhale") return "inhale";
    if (phase === "hold1") return "hold";
    if (phase === "hold2") return "pause";
    if (phase === "exhale") return "exhale";
    return "start";
  };

  return (
    <div className="space-y-6">
      <PatternSelector 
        patterns={breathingPatterns}
        selectedPattern={selectedPattern}
        onSelect={onSelectPattern}
      />
      
      {selectedPattern && showAnimation && (
        <div className="mt-8">
          <BreathingAnimation 
            isActive={isExerciseActive}
            phase={mapToAnimationPhase(currentPhase as string)}
            secondsLeft={selectedPattern ? 
              (currentPhase === "inhale" ? selectedPattern.inhale : 
              currentPhase === "hold1" ? selectedPattern.hold1 : 
              currentPhase === "exhale" ? selectedPattern.exhale : 
              currentPhase === "hold2" ? selectedPattern.hold2 : 0) : 0
            }
            inhaleDuration={selectedPattern.inhale * 1000}
            holdDuration={selectedPattern.hold1 * 1000}
            exhaleDuration={selectedPattern.exhale * 1000}
            voiceUrls={null}
            isVoiceActive={isExerciseActive}
            showPhaseText={true}
          />
        </div>
      )}
    </div>
  );
};

export default BreathingExercise;
