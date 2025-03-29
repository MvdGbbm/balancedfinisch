
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
          <BreathingAnimation 
            technique={selectedPattern.id === "1" ? "4-7-8" : selectedPattern.id === "2" ? "box-breathing" : "diaphragmatic"}
            voiceUrls={null}
            isVoiceActive={isExerciseActive}
            currentPhase={currentPhase}
            onPhaseChange={onPhaseChange}
            currentCycle={currentCycle}
            totalCycles={selectedPattern.cycles}
            exerciseCompleted={exerciseCompleted}
            inhaleTime={selectedPattern.inhale}
            holdTime={selectedPattern.hold1}
            exhaleTime={selectedPattern.exhale}
            pauseTime={selectedPattern.hold2}
          />
        </div>
      )}
    </div>
  );
};
