
import React from "react";
import { BreathingPhase } from "@/components/breathing/types";
import { PatternSelector } from "@/components/breathing-page/pattern-selector";
import { BreathingPattern } from "@/components/breathing-page/types";
import { BreathingCircle } from "@/components/breathing-circle";

interface BreathingExerciseProps {
  breathingPatterns: BreathingPattern[];
  selectedPattern: BreathingPattern | null;
  isExerciseActive: boolean;
  showAnimation: boolean;
  currentCycle: number;
  exerciseCompleted: boolean;
  currentPhase: BreathingPhase;
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
  // Determine if hold phase should be enabled based on the pattern
  const holdEnabled = selectedPattern && selectedPattern.hold1 > 0;

  return (
    <div className="space-y-6">
      <PatternSelector 
        breathingPatterns={breathingPatterns}
        selectedPattern={selectedPattern}
        isExerciseActive={isExerciseActive}
        onSelectPattern={onSelectPattern}
      />
      
      {selectedPattern && showAnimation && (
        <div className="mt-8">
          <BreathingCircle
            isActive={isExerciseActive}
            currentPhase={currentPhase}
            secondsLeft={0}
            inhaleDuration={selectedPattern.inhale * 1000}
            holdDuration={selectedPattern.hold1 * 1000}
            exhaleDuration={selectedPattern.exhale * 1000}
            holdEnabled={!!holdEnabled}
            onBreathComplete={() => {
              // Handle breath complete if needed
            }}
          />
        </div>
      )}
    </div>
  );
};
