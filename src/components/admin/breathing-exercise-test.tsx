
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Test: {pattern.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col items-center space-y-4">
            <CircleAnimation 
              circleScale={circleScale} 
              isActive={isActive}
              currentPhase={currentPhase}
            />
            
            <PhaseTimer 
              currentPhase={currentPhase}
              secondsLeft={secondsLeft}
              currentCycle={currentCycle}
              totalCycles={totalCycles}
              progress={progress}
            />
          </div>
          
          <div className="flex flex-col space-y-6">
            <AudioController 
              audioRef={audioRef}
              endAudioRef={endAudioRef}
              currentAudioUrl={currentAudioUrl}
            />
            
            <VoiceButtons 
              isActive={isActive}
              activeVoice={activeVoice}
              startWithVera={startWithVera}
              startWithMarco={startWithMarco}
            />
            
            <ControlButtons 
              isActive={isActive}
              setIsActive={setIsActive}
              resetExercise={resetExercise}
            />
            
            <div className="p-4 bg-muted rounded-md mt-4">
              <h3 className="font-medium mb-2">Patroon details:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Inademen:</div>
                <div>{pattern.inhale} sec</div>
                
                <div>Vasthouden 1:</div>
                <div>{pattern.hold1} sec</div>
                
                <div>Uitademen:</div>
                <div>{pattern.exhale} sec</div>
                
                <div>Vasthouden 2:</div>
                <div>{pattern.hold2} sec</div>
                
                <div>Cycli:</div>
                <div>{pattern.cycles}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
