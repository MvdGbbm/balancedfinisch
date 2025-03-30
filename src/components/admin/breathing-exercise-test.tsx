
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBreathingTest } from "./breathing/use-breathing-test";
import { AudioController } from "./breathing/audio-controller";
import { CircleAnimation } from "./breathing/circle-animation";
import { PhaseTimer } from "./breathing/phase-timer";
import { ControlButtons } from "./breathing/control-buttons";
import { VoiceButtons } from "./breathing/voice-buttons";
import { BreathingExerciseTestProps } from "./breathing/types";

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
    return <Card>
        <CardHeader>
          <CardTitle>Test Ademhalingspatroon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-muted-foreground">
            Selecteer of maak een ademhalingspatroon om te testen.
          </div>
        </CardContent>
      </Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test: {pattern.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          <CircleAnimation 
            circleScale={circleScale}
            setCircleScale={setCircleScale}
            currentPhase={currentPhase}
            isActive={isActive}
            secondsLeft={secondsLeft}
            pattern={pattern}
          />
          
          <PhaseTimer
            currentPhase={currentPhase}
            secondsLeft={secondsLeft}
            totalCycles={totalCycles}
            currentCycle={currentCycle}
            progress={progress}
            pattern={pattern}
          />
          
          <ControlButtons 
            isActive={isActive}
            setIsActive={setIsActive}
            resetExercise={resetExercise}
            activeVoice={activeVoice}
          />
          
          <VoiceButtons
            startWithVera={startWithVera}
            startWithMarco={startWithMarco}
            isActive={isActive}
            activeVoice={activeVoice}
          />
          
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
