
import React, { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BreathingCircle } from "@/components/breathing-circle";
import { toast } from "sonner";
import { BreathExerciseProps } from "./types/exercise-types";
import { useBreathingCycle } from "./hooks/use-breathing-cycle";
import { useBreathingAudio } from "./hooks/use-breathing-audio";
import { useVoiceUrls } from "./hooks/use-voice-urls";
import { PatternSelector } from "./exercise/pattern-selector";
import { VoiceControls } from "./exercise/voice-controls";
import { ResetButton } from "./exercise/reset-button";
import { ActiveVoice } from "./types/exercise-types";

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
  useEffect(() => {
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
  useEffect(() => {
    if (!selectedPattern) return;
    updateAudioForPhase();
  }, [currentPhase, selectedPattern, activeVoice]);

  // Play audio when active
  useEffect(() => {
    if (currentAudioUrl && isActive) {
      playAudio(isActive, currentAudioUrl);
    }
  }, [currentAudioUrl, isActive]);

  // Stop audio when exercise is paused
  useEffect(() => {
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

  // Maps breathing phases to circle component phases
  const mapPhaseToCirclePhase = (phase: "inhale" | "hold1" | "exhale" | "hold2"): "inhale" | "hold" | "exhale" | "rest" => {
    switch (phase) {
      case "inhale": return "inhale";
      case "hold1": return "hold";
      case "exhale": return "exhale";
      case "hold2": return "hold";
      default: return "rest";
    }
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

  // Handle starting with Vera voice
  const startWithVera = () => {
    if (isActive && activeVoice === "vera") {
      setIsActive(false);
      setActiveVoice("none");
      resetAudio();
    } else {
      setActiveVoice("vera");
      setIsActive(true);
      
      setTimeout(() => {
        const url = updateAudioForPhase();
        if (url) {
          playAudio(true, url);
        }
      }, 100);
    }
  };

  // Handle starting with Marco voice
  const startWithMarco = () => {
    if (isActive && activeVoice === "marco") {
      setIsActive(false);
      setActiveVoice("none");
      resetAudio();
    } else {
      setActiveVoice("marco");
      setIsActive(true);
      
      setTimeout(() => {
        const url = updateAudioForPhase();
        if (url) {
          playAudio(true, url);
        }
      }, 100);
    }
  };

  if (!selectedPattern || breathingPatterns.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Geen ademhalingstechnieken beschikbaar.
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <audio 
        ref={audioRef} 
        src={currentAudioUrl} 
        preload="auto" 
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
          
          <BreathingCircle
            isActive={isActive}
            currentPhase={mapPhaseToCirclePhase(currentPhase)}
            secondsLeft={secondsLeft}
            inhaleDuration={selectedPattern.inhale * 1000}
            holdDuration={selectedPattern.hold1 * 1000}
            exhaleDuration={selectedPattern.exhale * 1000}
          />
          
          <div className="text-center space-y-1 text-white mt-4">
            <p className="text-sm text-white/70">
              Cyclus {currentCycle} van {selectedPattern.cycles}
            </p>
          </div>
          
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
