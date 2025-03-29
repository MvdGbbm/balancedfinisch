
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBreathingTest } from "./breathing/use-breathing-test";
import { AudioController } from "./breathing/audio-controller";
import { CircleAnimation } from "./breathing/circle-animation";
import { PhaseTimer } from "./breathing/phase-timer";
import { ControlButtons } from "./breathing/control-buttons";
import { VoiceButtons } from "./breathing/voice-buttons";
import { BreathingExerciseTestProps } from "./breathing/types";

export function BreathingExerciseTest({ pattern }: BreathingExerciseTestProps) {
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
        <CardTitle>Test Ademhalingspatroon: {pattern.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <audio ref={audioRef} className="hidden" />
          <audio ref={endAudioRef} className="hidden" />
          
          <div className="flex flex-col items-center justify-center">
            {/* Audio controller (invisible component for audio logic) */}
            <AudioController 
              isActive={isActive}
              currentAudioUrl={currentAudioUrl}
              audioRef={audioRef}
            />
            
            {/* Breathing circle animation */}
            <CircleAnimation 
              isActive={isActive}
              currentPhase={currentPhase}
              secondsLeft={secondsLeft}
              pattern={pattern}
              circleScale={circleScale}
              setCircleScale={setCircleScale}
            />
            
            {/* Phase timer, instructions and cycle progress */}
            <PhaseTimer 
              progress={progress}
              currentPhase={currentPhase}
              currentCycle={currentCycle}
              totalCycles={totalCycles}
            />
            
            {/* Control buttons for starting/pausing and resetting */}
            <ControlButtons 
              isActive={isActive}
              setIsActive={setIsActive}
              resetExercise={resetExercise}
              activeVoice={activeVoice}
            />
            
            {/* Voice selection buttons */}
            <VoiceButtons 
              isActive={isActive}
              activeVoice={activeVoice}
              startWithVera={startWithVera}
              startWithMarco={startWithMarco}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
