
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { BreathExerciseProps } from "./types/exercise-types";
import { useBreathingCycle } from "./hooks/use-breathing-cycle";
import { useBreathingAudio } from "./hooks/use-breathing-audio";
import { useVoiceUrls } from "./hooks/use-voice-urls";
import { PatternSelector } from "./exercise/pattern-selector";
import { VoiceControls } from "./exercise/voice-controls";
import { ResetButton } from "./exercise/reset-button";
import { BreathingCircleContainer } from "./exercise/breathing-circle-container";
import { AudioHandler } from "./exercise/audio-handler";
import { ActiveVoice } from "@/lib/types";

export function BreathExercise({ 
  breathingPatterns, 
  selectedPattern, 
  onPatternChange 
}: BreathExerciseProps) {
  // Custom hooks
  const { 
    isActive, setIsActive, 
    currentPhase, setCurrentPhase, 
    currentCycle, setCurrentCycle, 
    secondsLeft, setSecondsLeft, 
    resetCycle 
  } = useBreathingCycle(selectedPattern);
  
  const { 
    audioRef, 
    currentAudioUrl, setCurrentAudioUrl, 
    updateCurrentAudioUrl, 
    playAudio, 
    resetAudio 
  } = useBreathingAudio();
  
  const {
    veraVoiceUrls,
    marcoVoiceUrls,
    forceReloadVoiceUrls
  } = useVoiceUrls();
  
  // Local state
  const [activeVoice, setActiveVoice] = React.useState<ActiveVoice>("none");
  const [audioError, setAudioError] = React.useState(false);

  // Handle visibility changes
  React.useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      // If the page becomes visible again and was active, force reload
      if (isActive) {
        setIsActive(false);
        updateAudioForPhase();
      }
    }
  };

  // Update audio URL when phase changes
  React.useEffect(() => {
    if (!selectedPattern) return;
    updateAudioForPhase();
  }, [currentPhase, selectedPattern, activeVoice]);

  // Play audio when active
  React.useEffect(() => {
    if (currentAudioUrl && isActive) {
      playAudio(isActive, currentAudioUrl);
    }
  }, [currentAudioUrl, isActive]);

  // Stop audio when exercise is paused
  React.useEffect(() => {
    if (!isActive && audioRef.current) {
      resetAudio();
    }
  }, [isActive]);

  // Update audio URL based on current phase
  const updateAudioForPhase = () => {
    if (!selectedPattern) return;
    
    const url = updateCurrentAudioUrl(
      activeVoice,
      currentPhase,
      veraVoiceUrls,
      marcoVoiceUrls,
      selectedPattern
    );
    
    return url;
  };

  // Reset the exercise completely
  const resetExercise = () => {
    if (!selectedPattern) return;
    
    forceReload();
  };

  // Force reload all state and audio
  const forceReload = () => {
    resetCycle();
    resetAudio();
    forceReloadVoiceUrls();
    setActiveVoice("none");
    setAudioError(false);
    
    toast.success("Ademhalingsoefening opnieuw geladen", {
      description: "Audio en instellingen zijn ververst."
    });
  };

  // Handle starting with voice guides
  const startWithVoice = (voice: ActiveVoice) => {
    if (isActive && activeVoice === voice) {
      setIsActive(false);
      setActiveVoice("none");
      resetAudio();
    } else {
      setActiveVoice(voice);
      setIsActive(true);
      
      setTimeout(() => {
        const url = updateAudioForPhase();
        if (url) {
          playAudio(true, url);
        }
      }, 100);
    }
  };

  // Specific handlers for each voice
  const startWithVera = () => startWithVoice("vera");
  const startWithMarco = () => startWithVoice("marco");

  if (!selectedPattern || breathingPatterns.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Geen ademhalingstechnieken beschikbaar.
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <AudioHandler 
        audioRef={audioRef}
        currentAudioUrl={currentAudioUrl}
        isActive={isActive}
        onError={() => setAudioError(true)}
      />
      
      <Card className="overflow-hidden bg-navy-900 border-none shadow-xl">
        <CardContent className="p-6">
          <PatternSelector
            patterns={breathingPatterns}
            selectedPatternId={selectedPattern.id}
            onPatternChange={onPatternChange}
            disabled={isActive}
          />
          
          <BreathingCircleContainer
            isActive={isActive}
            currentPhase={currentPhase}
            secondsLeft={secondsLeft}
            selectedPattern={selectedPattern}
            currentCycle={currentCycle}
            totalCycles={selectedPattern.cycles}
          />
          
          <VoiceControls
            activeVoice={activeVoice}
            isActive={isActive}
            veraVoiceUrls={veraVoiceUrls}
            marcoVoiceUrls={marcoVoiceUrls}
            onStartWithVera={startWithVera}
            onStartWithMarco={startWithMarco}
          />
          
          <ResetButton onReset={resetExercise} />
        </CardContent>
      </Card>
    </div>
  );
}
