
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBreathingTest } from "./breathing/use-breathing-test";
import { AudioController } from "./breathing/audio-controller";
import { CircleAnimation } from "./breathing/circle-animation";
import { PhaseTimer } from "./breathing/phase-timer";
import { ControlButtons } from "./breathing/control-buttons";
import { VoiceButtons } from "./breathing/voice-buttons";
import { BreathingExerciseTestProps } from "./breathing/types";
import { BreathingCircle } from "@/components/breathing-circle";

export function BreathingExerciseTest({
  pattern
}: BreathingExerciseTestProps) {
  const {
    isActive,
    setIsActive,
    currentPhase,
    currentCycle,
    secondsLeft,
    progress,
    audioRef,
    endAudioRef,
    currentAudioUrl,
    activeVoice,
    circleScale,
    setCircleScale,
    resetExercise,
    startWithVera,
    startWithMarco,
    totalCycles
  } = useBreathingTest(pattern);

  if (!pattern) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Ademhalingspatroon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-muted-foreground">
            Selecteer of maak een ademhalingspatroon om te testen.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test: {pattern.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-6">
          <BreathingCircle
            isActive={isActive}
            currentPhase={currentPhase === "hold1" || currentPhase === "hold2" ? "hold" : currentPhase === "inhale" ? "inhale" : currentPhase === "exhale" ? "exhale" : "rest"}
            secondsLeft={secondsLeft}
            inhaleDuration={pattern.inhale * 1000}
            holdDuration={pattern.hold1 * 1000}
            exhaleDuration={pattern.exhale * 1000}
            animationEnabled={pattern.animationEnabled}
            animationStyle={pattern.animationStyle}
            animationColor={pattern.animationColor}
          />
          
          <PhaseTimer
            progress={progress}
            currentPhase={currentPhase}
            currentCycle={currentCycle}
            totalCycles={totalCycles}
          />
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <VoiceButtons
              isActive={isActive}
              startWithVera={startWithVera}
              startWithMarco={startWithMarco}
              activeVoice={activeVoice}
            />
            
            <ControlButtons
              isActive={isActive}
              setIsActive={setIsActive}
              resetExercise={resetExercise}
            />
          </div>
          
          <AudioController 
            audioRef={audioRef}
            endAudioRef={endAudioRef}
            currentAudioUrl={currentAudioUrl}
          />
        </div>
      </CardContent>
    </Card>
  );
}
