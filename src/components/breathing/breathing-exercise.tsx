
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { BreathingCircle } from "./components/breathing-circle";
import { useBreathingState } from "./hooks/use-breathing-state";
import { useBreathingAudio } from "./hooks/use-breathing-audio";
import { CycleProgress } from "@/components/cycle-progress";
import { BreathingSettings } from "./core/types";
import { toast } from "sonner";

interface BreathingExerciseProps {
  settings: BreathingSettings;
  voiceUrls?: {
    start?: string;
    inhale: string;
    hold: string;
    exhale: string;
    end?: string;
  } | null;
  onComplete?: () => void;
  className?: string;
}

export function BreathingExercise({ 
  settings,
  voiceUrls = null,
  onComplete,
  className
}: BreathingExerciseProps) {
  const [voiceEnabled, setVoiceEnabled] = useState(!!voiceUrls);
  const [voiceVolume, setVoiceVolume] = useState(0.8);
  
  // Initialize breathing state
  const {
    state,
    startExercise,
    stopExercise,
    resetExercise,
    toggleExercise
  } = useBreathingState({
    settings,
    onExerciseComplete: () => {
      toast.success("Ademhalingsoefening voltooid!");
      if (onComplete) onComplete();
    }
  });
  
  // Initialize audio
  const {
    audioRef,
    audioError,
    playAudio
  } = useBreathingAudio({
    voiceUrls: voiceEnabled ? voiceUrls : null,
    isActive: state.isActive,
    currentPhase: state.currentPhase,
    volume: voiceVolume,
    skipPhase: settings.holdDuration <= 0 ? "hold" : null
  });

  // Toggle voice guidance
  const toggleVoice = () => {
    if (!voiceUrls) return;
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          {/* Audio element for voice guidance */}
          <audio ref={audioRef} style={{ display: 'none' }} />
          
          {/* Breathing circle */}
          <BreathingCircle 
            state={state}
            settings={settings}
          />
          
          {/* Cycle progress */}
          {settings.showCycleCount !== false && (
            <CycleProgress 
              currentCycle={state.currentCycle} 
              totalCycles={settings.cycles} 
              className="mt-4"
            />
          )}
          
          {/* Control buttons */}
          <div className="flex gap-3 mt-6">
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleExercise}
            >
              {state.isActive ? <Pause size={18} /> : <Play size={18} />}
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={resetExercise}
              disabled={state.isActive}
            >
              <RotateCcw size={18} />
            </Button>
            
            {voiceUrls && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={toggleVoice}
                disabled={state.isActive}
              >
                {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
