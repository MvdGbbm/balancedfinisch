
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
        patterns={breathingPatterns}
        selectedPattern={selectedPattern}
        onSelect={onSelectPattern}
      />
      
      {selectedPattern && showAnimation && (
        <div className="mt-8">
          <BreathingAnimation 
            isActive={isExerciseActive}
            phase={currentPhase}
            secondsLeft={selectedPattern ? 
              (currentPhase === "inhale" ? selectedPattern.inhale : 
              currentPhase === "hold" ? selectedPattern.hold1 : 
              currentPhase === "exhale" ? selectedPattern.exhale : 0) : 0
            }
            inhaleDuration={selectedPattern.inhale}
            holdDuration={selectedPattern.hold1}
            exhaleDuration={selectedPattern.exhale}
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
