
import React, { useEffect } from "react";
import { BreathingAnimation } from "@/components/breathing/breathing-animation";
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
  veraVoiceUrls?: any;
  marcoVoiceUrls?: any;
  activeVoice?: "vera" | "marco" | null;
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
  onPhaseChange,
  veraVoiceUrls,
  marcoVoiceUrls,
  activeVoice
}) => {
  // Debug log when component renders or props change
  useEffect(() => {
    console.log("BreathingExercise rendering with props:", {
      selectedPattern,
      isExerciseActive,
      currentPhase,
      activeVoice,
      voiceUrls: activeVoice === "vera" ? veraVoiceUrls : activeVoice === "marco" ? marcoVoiceUrls : null
    });
  }, [selectedPattern, isExerciseActive, currentPhase, activeVoice, veraVoiceUrls, marcoVoiceUrls]);

  // Determine which voice URLs to use based on activeVoice
  const voiceUrls = activeVoice === "vera" ? veraVoiceUrls : 
                    activeVoice === "marco" ? marcoVoiceUrls : null;

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
            voiceUrls={voiceUrls}
            isVoiceActive={isExerciseActive && !!activeVoice}
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
