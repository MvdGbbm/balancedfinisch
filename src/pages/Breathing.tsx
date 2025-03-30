
import React, { useState, useEffect, useRef } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { toast } from "sonner";
import BreathingPatternSelector from "@/components/breathing/breathing-pattern-selector";
import BreathingExerciseAnimation from "@/components/breathing/breathing-exercise-animation";
import { BreathingControls } from "@/components/breathing/breathing-controls";
import { BreathingPhase } from '@/components/breathing/types';

const Breathing = () => {
  // Core breathing session state and hooks
  const {
    breathingPatterns,
    selectedPattern,
    isExerciseActive,
    activeVoice,
    currentPhase,
    showAnimation,
    currentCycle,
    exerciseCompleted,
    voiceVolume,
    musicVolume,
    handleSelectPattern,
    handleActivateVoice,
    handlePauseVoice,
    handlePhaseChange,
    handleVoiceVolumeChange,
    handleMusicVolumeChange
  } = useBreathingSession();
  
  // Audio references
  const startAudioRef = useRef<HTMLAudioElement | null>(null);
  const endAudioRef = useRef<HTMLAudioElement | null>(null);

  return (
    <MobileLayout>
      <div className="container py-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-4">Ademhalingsoefeningen</h1>
        
        <div className="space-y-6">
          <BreathingPatternSelector 
            breathingPatterns={breathingPatterns}
            selectedPattern={selectedPattern}
            isExerciseActive={isExerciseActive}
            onSelectPattern={handleSelectPattern}
          />
          
          {selectedPattern && showAnimation && (
            <BreathingExerciseAnimation 
              technique={selectedPattern.id === "1" ? "4-7-8" : selectedPattern.id === "2" ? "box-breathing" : "diaphragmatic"}
              voiceUrls={activeVoice === "vera" ? {
                inhale: "https://example.com/vera/inhale.mp3",
                hold: "https://example.com/vera/hold.mp3",
                exhale: "https://example.com/vera/exhale.mp3",
              } : activeVoice === "marco" ? {
                inhale: "https://example.com/marco/inhale.mp3",
                hold: "https://example.com/marco/hold.mp3",
                exhale: "https://example.com/marco/exhale.mp3",
              } : null}
              isVoiceActive={isExerciseActive && !!activeVoice}
              currentPhase={currentPhase}
              onPhaseChange={(phase) => handlePhaseChange(phase)}
              currentCycle={currentCycle}
              totalCycles={selectedPattern.cycles}
              exerciseCompleted={exerciseCompleted}
              inhaleTime={selectedPattern.inhale}
              holdTime={selectedPattern.hold1}
              exhaleTime={selectedPattern.exhale}
              pauseTime={selectedPattern.hold2}
            />
          )}
          
          <BreathingControls 
            isPlaying={isExerciseActive}
            onTogglePlay={isExerciseActive ? handlePauseVoice : () => handleActivateVoice("vera")}
            onSkipToNextPhase={() => console.log("Skip to next phase")}
            currentPhase={currentPhase}
            currentCycle={currentCycle}
            totalCycles={selectedPattern?.cycles || 0}
            completionPercentage={(currentCycle / (selectedPattern?.cycles || 1)) * 100}
            breathsCompleted={currentCycle - 1}
            volume={voiceVolume * 100}
            onVolumeChange={(values) => handleVoiceVolumeChange(values[0] / 100)}
            isMuted={voiceVolume <= 0}
            onToggleMute={() => handleVoiceVolumeChange(voiceVolume > 0 ? 0 : 0.8)}
          />
        </div>
      </div>
    </MobileLayout>
  );
};

// Hook for managing breathing session state
function useBreathingSession() {
  const [breathingPatterns, setBreathingPatterns] = useState([
    { id: "1", name: "4-7-8 Ademhaling", description: "Inademen (4s), vasthouden (7s), uitademen (8s)", inhale: 4, hold1: 7, exhale: 8, hold2: 0, cycles: 5 },
    { id: "2", name: "Box Breathing", description: "Inademen (4s), vasthouden (4s), uitademen (4s), pauze (4s)", inhale: 4, hold1: 4, exhale: 4, hold2: 4, cycles: 4 },
    { id: "3", name: "Diafragmatische Ademhaling", description: "Diepe buikademhaling. Inademen (4s), uitademen (6s)", inhale: 4, hold1: 0, exhale: 6, hold2: 0, cycles: 6 }
  ]);
  
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [activeVoice, setActiveVoice] = useState(null);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>("start");
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(0.8);
  const [musicVolume, setMusicVolume] = useState(0.5);
  
  const handleSelectPattern = (pattern) => {
    setSelectedPattern(pattern);
    
    if (isExerciseActive) {
      setIsExerciseActive(false);
      setActiveVoice(null);
    }
    
    setCurrentCycle(1);
    setExerciseCompleted(false);
    setShowAnimation(true);
    
    toast.success(`${pattern.name} geselecteerd`);
  };
  
  const handleActivateVoice = (voice) => {
    if (!selectedPattern) {
      toast.error("Selecteer eerst een ademhalingspatroon");
      return;
    }
    
    setActiveVoice(voice);
    setIsExerciseActive(true);
    setCurrentPhase("inhale");
    setCurrentCycle(1);
    setExerciseCompleted(false);
    
    toast.success(`Start ${selectedPattern.name} met ${voice === "vera" ? "Vera" : "Marco"} stem`);
  };
  
  const handlePauseVoice = () => {
    setIsExerciseActive(false);
    toast.info("Oefening gepauzeerd");
  };
  
  const handlePhaseChange = (newPhase: BreathingPhase) => {
    setCurrentPhase(newPhase);
    
    if (newPhase === "inhale" && currentPhase === "pause") {
      if (selectedPattern && currentCycle < selectedPattern.cycles) {
        setCurrentCycle(prevCycle => prevCycle + 1);
      } else if (selectedPattern && currentCycle >= selectedPattern.cycles) {
        setIsExerciseActive(false);
        setExerciseCompleted(true);
        
        toast.success("Oefening voltooid!");
      }
    }
  };
  
  const handleVoiceVolumeChange = (volume) => {
    setVoiceVolume(volume);
  };
  
  const handleMusicVolumeChange = (volume) => {
    setMusicVolume(volume);
  };
  
  return {
    breathingPatterns,
    selectedPattern,
    isExerciseActive,
    activeVoice,
    currentPhase,
    showAnimation,
    currentCycle,
    exerciseCompleted,
    voiceVolume,
    musicVolume,
    handleSelectPattern,
    handleActivateVoice,
    handlePauseVoice,
    handlePhaseChange,
    handleVoiceVolumeChange,
    handleMusicVolumeChange
  };
}

export default Breathing;
