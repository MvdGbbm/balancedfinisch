
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BreathingCircle } from "@/components/breathing-circle";
import { BreathExerciseProps } from "./types";
import { useBreathingExerciseState } from "./use-breathing-exercise-state";
import { BreathingAudioPlayer } from "./breathing-audio-player";
import { BreathingPatternSelector } from "./breathing-pattern-selector";
import { BreathingCycleTracker } from "./breathing-cycle-tracker";
import { BreathingExerciseControls } from "./breathing-exercise-controls";

export function BreathExercise({ 
  breathingPatterns, 
  selectedPattern, 
  onPatternChange 
}: BreathExerciseProps) {
  const {
    state,
    audioRef,
    startWithVera,
    startWithMarco,
    resetExercise,
    handleAudioError,
    mapPhaseToCirclePhase
  } = useBreathingExerciseState(selectedPattern);

  if (!selectedPattern || breathingPatterns.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Geen ademhalingstechnieken beschikbaar.
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <BreathingAudioPlayer 
        audioRef={audioRef}
        currentAudioUrl={state.currentAudioUrl}
        onAudioError={handleAudioError}
      />
      
      <Card className="overflow-hidden bg-navy-900 border-none shadow-xl">
        <CardContent className="p-6">
          <BreathingPatternSelector 
            breathingPatterns={breathingPatterns}
            selectedPattern={selectedPattern}
            isActive={state.isActive}
            onPatternChange={onPatternChange}
          />
          
          <BreathingCircle
            isActive={state.isActive}
            currentPhase={mapPhaseToCirclePhase(state.currentPhase)}
            secondsLeft={state.secondsLeft}
            inhaleDuration={selectedPattern.inhale * 1000}
            holdDuration={selectedPattern.hold1 * 1000}
            exhaleDuration={selectedPattern.exhale * 1000}
          />
          
          <BreathingCycleTracker 
            currentCycle={state.currentCycle}
            totalCycles={selectedPattern.cycles}
          />
          
          <BreathingExerciseControls 
            isActive={state.isActive}
            activeVoice={state.activeVoice}
            onStartWithVera={startWithVera}
            onStartWithMarco={startWithMarco}
            onReset={resetExercise}
          />
        </CardContent>
      </Card>
    </div>
  );
}
