
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { BreathingPhase } from "@/components/breathing/types";
import { BreathingPattern, VoiceURLs } from "@/components/breathing-page/types";
import { Soundscape } from "@/lib/types";
import { loadVoiceUrls, handleActivateVoice } from "@/components/breathing-page/utils";

// Default breathing patterns to prevent undefined errors
const defaultBreathingPatterns: BreathingPattern[] = [
  {
    id: "1",
    name: "4-7-8 Techniek",
    description: "Inademen voor 4, vasthouden voor 7, uitademen voor 8",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 3
  },
  {
    id: "2",
    name: "Box Breathing",
    description: "Inademen voor 4, vasthouden voor 4, uitademen voor 4, vasthouden voor 4",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    cycles: 4
  }
];

// Default voice URLs
const defaultVoiceUrls = {
  vera: {
    inhale: "",
    hold: "",
    exhale: "",
    start: "",
    end: ""
  },
  marco: {
    inhale: "",
    hold: "",
    exhale: "",
    start: "",
    end: ""
  }
};

export function useBreathingExercise() {
  // Pattern state
  const [breathingPatterns, setBreathingPatterns] = useState<BreathingPattern[]>(defaultBreathingPatterns);
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
  
  // Exercise state
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [activeVoice, setActiveVoice] = useState<"vera" | "marco" | null>(null);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>("start");
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  
  // Audio refs
  const startAudioRef = useRef<HTMLAudioElement | null>(null);
  const endAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Voice state
  const [veraVoiceUrls, setVeraVoiceUrls] = useState<VoiceURLs>(defaultVoiceUrls.vera);
  const [marcoVoiceUrls, setMarcoVoiceUrls] = useState<VoiceURLs>(defaultVoiceUrls.marco);
  const [voiceUrlsValidated, setVoiceUrlsValidated] = useState<boolean>(false);
  
  // Volume state
  const [voiceVolume, setVoiceVolume] = useState<number>(0.8);
  const [musicVolume, setMusicVolume] = useState<number>(0.5);

  // Music state
  const [musicTracks, setMusicTracks] = useState<Soundscape[]>([]);

  // Load patterns and voice URLs on initialization - optimized with useCallback
  const initializeBreathingData = useCallback(() => {
    const savedPatterns = localStorage.getItem('breathingPatterns');
    if (savedPatterns) {
      try {
        const parsedPatterns = JSON.parse(savedPatterns);
        setBreathingPatterns(parsedPatterns);
        if (parsedPatterns.length > 0) {
          setSelectedPattern(parsedPatterns[0]);
        }
      } catch (error) {
        console.error("Error loading breathing patterns:", error);
        setBreathingPatterns(defaultBreathingPatterns);
        setSelectedPattern(defaultBreathingPatterns[0]);
      }
    } else {
      setSelectedPattern(defaultBreathingPatterns[0]);
    }
    
    loadVoiceUrls(setVeraVoiceUrls, setMarcoVoiceUrls, defaultVoiceUrls, setVoiceUrlsValidated);
  }, []);
  
  useEffect(() => {
    initializeBreathingData();
  }, [initializeBreathingData]);

  // Use useCallback for handlers to prevent unnecessary re-renders
  const handleSelectPattern = useCallback((patternId: string) => {
    const pattern = breathingPatterns.find(p => p.id === patternId);
    if (pattern) {
      setSelectedPattern(pattern);
      setIsExerciseActive(false);
      setActiveVoice(null);
      setCurrentPhase("start");
      setCurrentCycle(1);
      setExerciseCompleted(false);
      
      setShowAnimation(true);
    }
  }, [breathingPatterns]);

  const onActivateVoice = async (voice: "vera" | "marco") => {
    await handleActivateVoice(
      voice,
      veraVoiceUrls,
      marcoVoiceUrls,
      selectedPattern,
      startAudioRef,
      setActiveVoice,
      setIsExerciseActive,
      setCurrentPhase,
      setShowAnimation,
      setCurrentCycle,
      setExerciseCompleted
    );
  };

  const handlePauseVoice = () => {
    setIsExerciseActive(false);
  };

  const handlePhaseChange = useCallback((phase: BreathingPhase) => {
    setCurrentPhase(phase);
    
    if (phase === "inhale" && currentPhase === "pause") {
      if (selectedPattern && currentCycle < selectedPattern.cycles) {
        setCurrentCycle(prevCycle => prevCycle + 1);
      } else if (selectedPattern && currentCycle >= selectedPattern.cycles && phase === "inhale") {
        handleExerciseComplete();
      }
    }
  }, [currentPhase, currentCycle, selectedPattern]);

  const handleExerciseComplete = useCallback(() => {
    setIsExerciseActive(false);
    setExerciseCompleted(true);
    setShowAnimation(true);
    
    if (selectedPattern?.endUrl && endAudioRef.current) {
      try {
        endAudioRef.current.src = selectedPattern.endUrl;
        endAudioRef.current.load();
        endAudioRef.current.play().catch(err => {
          console.error("Error playing end audio:", err);
          toast.error("Kon audio niet afspelen");
        });
      } catch (error) {
        console.error("Error with end audio:", error);
      }
    }
    
    toast.success("Ademhalingsoefening voltooid!");
  }, [selectedPattern]);

  const handleVoiceVolumeChange = (volume: number) => {
    setVoiceVolume(volume);
    if (startAudioRef.current) {
      startAudioRef.current.volume = volume;
    }
    if (endAudioRef.current) {
      endAudioRef.current.volume = volume;
    }
  };

  const handleMusicVolumeChange = (volume: number) => {
    setMusicVolume(volume);
  };

  return {
    // State
    breathingPatterns,
    selectedPattern,
    isExerciseActive,
    activeVoice,
    currentPhase,
    showAnimation,
    currentCycle,
    exerciseCompleted,
    veraVoiceUrls,
    marcoVoiceUrls,
    voiceVolume,
    musicVolume,
    musicTracks,
    
    // Refs
    startAudioRef,
    endAudioRef,
    
    // Handlers
    setMusicTracks,
    handleSelectPattern,
    onActivateVoice,
    handlePauseVoice,
    handlePhaseChange,
    handleVoiceVolumeChange,
    handleMusicVolumeChange,
  };
}
