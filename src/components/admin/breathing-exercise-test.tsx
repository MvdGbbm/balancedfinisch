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
  return <Card className="w-full">
      
      
    </Card>;
}