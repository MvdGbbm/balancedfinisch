
import React, { useState, useEffect } from "react";
import { BreathingPattern } from "@/lib/types";
import { BreathingControls } from "./breathing-controls";
import { BreathingVisualizer } from "./breathing-visualizer";
import { BreathingPhaseDisplay } from "./breathing-phase-display";
import { BreathingPatternDetails } from "./breathing-pattern-details";
import { BreathingAudioManager } from "./breathing-audio-manager";
import { BreathingExerciseState } from "./types";

interface BreathingExerciseTesterProps {
  pattern: BreathingPattern;
}

export function BreathingExerciseTester({ pattern }: BreathingExerciseTesterProps) {
  const [state, setState] = useState<BreathingExerciseState>({
    isActive: false,
    currentPhase: "inhale",
    currentCycle: 1,
    secondsLeft: pattern.inhale,
    progress: 0,
    circleScale: 1,
    activeVoice: null,
    exerciseCompleted: false,
    audioError: false,
    currentAudioUrl: ""
  });

  // Reset exercise when pattern changes
  useEffect(() => {
    setState({
      isActive: false,
      currentPhase: "inhale",
      currentCycle: 1,
      secondsLeft: pattern.inhale,
      progress: 0,
      circleScale: 1,
      activeVoice: null,
      exerciseCompleted: false,
      audioError: false,
      currentAudioUrl: ""
    });
  }, [pattern]);

  return (
    <div className="mb-6">
      <BreathingPhaseDisplay 
        currentPhase={state.currentPhase} 
        currentCycle={state.currentCycle}
        totalCycles={pattern.cycles}
        secondsLeft={state.secondsLeft}
      />
      
      <BreathingVisualizer 
        progress={state.progress} 
        circleScale={state.circleScale} 
        isActive={state.isActive}
        currentPhase={state.currentPhase}
      />
      
      <BreathingControls 
        pattern={pattern}
        isActive={state.isActive}
        activeVoice={state.activeVoice}
        onReset={() => setState({
          ...state,
          isActive: false,
          currentPhase: "inhale",
          currentCycle: 1,
          secondsLeft: pattern.inhale,
          progress: 0,
          circleScale: 1,
          activeVoice: null,
          exerciseCompleted: false
        })}
        setState={setState}
        state={state}
      />
      
      <BreathingPatternDetails pattern={pattern} />
      
      <BreathingAudioManager 
        pattern={pattern}
        state={state}
        setState={setState}
      />
    </div>
  );
}
