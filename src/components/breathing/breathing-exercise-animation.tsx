
import React from "react";
import BreathingAnimation from "@/components/breathing/breathing-animation";
import { BreathingPhase, BreathingTechnique } from "@/components/breathing/types";

interface BreathingExerciseAnimationProps {
  technique: BreathingTechnique;
  voiceUrls: {
    start?: string;
    inhale: string;
    hold: string;
    exhale: string;
  } | null;
  isVoiceActive: boolean;
  currentPhase: BreathingPhase;
  onPhaseChange: (phase: BreathingPhase) => void;
  currentCycle: number;
  totalCycles: number;
  exerciseCompleted: boolean;
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
  pauseTime: number;
}

const BreathingExerciseAnimation: React.FC<BreathingExerciseAnimationProps> = ({
  technique,
  voiceUrls,
  isVoiceActive,
  currentPhase,
  onPhaseChange,
  currentCycle,
  totalCycles,
  exerciseCompleted,
  inhaleTime,
  holdTime,
  exhaleTime,
  pauseTime,
}) => {
  return (
    <div className="mt-8">
      <BreathingAnimation 
        technique={technique}
        voiceUrls={voiceUrls}
        isVoiceActive={isVoiceActive}
        currentPhase={currentPhase}
        onPhaseChange={onPhaseChange}
        currentCycle={currentCycle}
        totalCycles={totalCycles}
        exerciseCompleted={exerciseCompleted}
        inhaleTime={inhaleTime}
        holdTime={holdTime}
        exhaleTime={exhaleTime}
        pauseTime={pauseTime}
      />
    </div>
  );
};

export default BreathingExerciseAnimation;
