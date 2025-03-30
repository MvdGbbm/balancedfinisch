
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { BreathingPattern } from "@/lib/types";
import { BreathingPhase, VoiceType, BreathingExerciseState } from "./types";

export function useBreathingExerciseState(selectedPattern: BreathingPattern | null) {
  // State
  const [state, setState] = useState<BreathingExerciseState>({
    isActive: false,
    currentPhase: "inhale",
    currentCycle: 1,
    secondsLeft: selectedPattern?.inhale || 0,
    activeVoice: "none",
    audioError: false,
    currentAudioUrl: ""
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Voice URLs
  const [veraVoiceUrls, setVeraVoiceUrls] = useState<{inhale: string, hold: string, exhale: string, end?: string}>({
    inhale: "",
    hold: "",
    exhale: "",
    end: ""
  });
  
  const [marcoVoiceUrls, setMarcoVoiceUrls] = useState<{inhale: string, hold: string, exhale: string, end?: string}>({
    inhale: "",
    hold: "",
    exhale: "",
    end: ""
  });

  // Load voice URLs from localStorage
  useEffect(() => {
    loadVoiceUrls();
  }, []);
  
  const loadVoiceUrls = () => {
    // Load Vera voice URLs
    const savedVeraUrls = localStorage.getItem('veraVoiceUrls');
    if (savedVeraUrls) {
      try {
        const parsedUrls = JSON.parse(savedVeraUrls);
        setVeraVoiceUrls(parsedUrls);
      } catch (error) {
        console.error("Error loading Vera voice URLs:", error);
      }
    }
    
    // Load Marco voice URLs
    const savedMarcoUrls = localStorage.getItem('marcoVoiceUrls');
    if (savedMarcoUrls) {
      try {
        const parsedUrls = JSON.parse(savedMarcoUrls);
        setMarcoVoiceUrls(parsedUrls);
      } catch (error) {
        console.error("Error loading Marco voice URLs:", error);
      }
    }
  };

  // Reset state when pattern changes
  useEffect(() => {
    if (!selectedPattern) return;
    
    setState(prev => ({
      ...prev,
      isActive: false,
      currentPhase: "inhale",
      currentCycle: 1,
      secondsLeft: selectedPattern.inhale,
      audioError: false
    }));
    
    updateCurrentAudioUrl();
  }, [selectedPattern]);
  
  // Update audio URL based on current phase and active voice
  const updateCurrentAudioUrl = () => {
    if (!selectedPattern) return;
    
    let url = "";
    
    if (state.activeVoice === "vera") {
      // Use Vera voice URLs
      switch (state.currentPhase) {
        case "inhale":
          url = veraVoiceUrls.inhale || "";
          break;
        case "hold1":
        case "hold2":
          url = veraVoiceUrls.hold || "";
          break;
        case "exhale":
          url = veraVoiceUrls.exhale || "";
          break;
      }
    } else if (state.activeVoice === "marco") {
      // Use Marco voice URLs
      switch (state.currentPhase) {
        case "inhale":
          url = marcoVoiceUrls.inhale || "";
          break;
        case "hold1":
        case "hold2":
          url = marcoVoiceUrls.hold || "";
          break;
        case "exhale":
          url = marcoVoiceUrls.exhale || "";
          break;
      }
    } else {
      // Default to pattern URLs if no voice is selected
      switch (state.currentPhase) {
        case "inhale":
          url = selectedPattern.inhaleUrl || "";
          break;
        case "hold1":
          url = selectedPattern.hold1Url || "";
          break;
        case "exhale":
          url = selectedPattern.exhaleUrl || "";
          break;
        case "hold2":
          url = selectedPattern.hold2Url || "";
          break;
      }
    }
    
    setState(prev => ({
      ...prev,
      currentAudioUrl: url,
      audioError: false
    }));
  };

  // Update and play audio when phase changes
  useEffect(() => {
    if (!selectedPattern || !audioRef.current) return;
    
    updateCurrentAudioUrl();
    
    if (state.currentAudioUrl && state.isActive) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      audioRef.current.src = state.currentAudioUrl;
      audioRef.current.load();
      
      const playAudio = () => {
        if (audioRef.current && state.isActive) {
          audioRef.current.play().catch(error => {
            console.error("Error playing audio:", error);
            setState(prev => ({ ...prev, audioError: true }));
          });
        }
      };
      
      setTimeout(playAudio, 100);
    }
  }, [state.currentPhase, selectedPattern, state.isActive, state.currentAudioUrl, state.activeVoice]);

  // Breathing timer effect
  useEffect(() => {
    if (!selectedPattern) return;
    
    let timer: number | null = null;
    
    if (state.isActive) {
      timer = window.setInterval(() => {
        if (state.secondsLeft > 1) {
          setState(prev => ({ ...prev, secondsLeft: prev.secondsLeft - 1 }));
        } else {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          
          setState(prev => {
            if (prev.currentPhase === "inhale") {
              // Move to hold1 or exhale if no hold1
              if (selectedPattern.hold1 && selectedPattern.hold1 > 0) {
                return {
                  ...prev,
                  currentPhase: "hold1",
                  secondsLeft: selectedPattern.hold1 || 1
                };
              } else {
                return {
                  ...prev,
                  currentPhase: "exhale",
                  secondsLeft: selectedPattern.exhale
                };
              }
            } else if (prev.currentPhase === "hold1") {
              return {
                ...prev,
                currentPhase: "exhale",
                secondsLeft: selectedPattern.exhale
              };
            } else if (prev.currentPhase === "exhale") {
              if (selectedPattern.hold2 && selectedPattern.hold2 > 0) {
                return {
                  ...prev,
                  currentPhase: "hold2",
                  secondsLeft: selectedPattern.hold2
                };
              } else {
                // No hold2, move to next cycle or complete
                if (prev.currentCycle < selectedPattern.cycles) {
                  return {
                    ...prev,
                    currentCycle: prev.currentCycle + 1,
                    currentPhase: "inhale",
                    secondsLeft: selectedPattern.inhale
                  };
                } else {
                  toast.success("Ademhalingsoefening voltooid!");
                  return {
                    ...prev,
                    isActive: false,
                    currentCycle: 1,
                    currentPhase: "inhale",
                    secondsLeft: selectedPattern.inhale,
                    activeVoice: "none"
                  };
                }
              }
            } else if (prev.currentPhase === "hold2") {
              // End of hold2, move to next cycle or complete
              if (prev.currentCycle < selectedPattern.cycles) {
                return {
                  ...prev,
                  currentCycle: prev.currentCycle + 1,
                  currentPhase: "inhale",
                  secondsLeft: selectedPattern.inhale
                };
              } else {
                toast.success("Ademhalingsoefening voltooid!");
                return {
                  ...prev,
                  isActive: false,
                  currentCycle: 1,
                  currentPhase: "inhale",
                  secondsLeft: selectedPattern.inhale,
                  activeVoice: "none"
                };
              }
            }
            return prev;
          });
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.isActive, state.currentPhase, state.secondsLeft, state.currentCycle, selectedPattern]);

  // Stop audio when exercise is paused
  useEffect(() => {
    if (!state.isActive && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [state.isActive]);

  const startWithVera = () => {
    if (state.isActive && state.activeVoice === "vera") {
      setState(prev => ({
        ...prev,
        isActive: false,
        activeVoice: "none"
      }));
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } else {
      setState(prev => ({
        ...prev,
        activeVoice: "vera",
        isActive: true
      }));
      
      setTimeout(() => {
        if (audioRef.current && state.currentAudioUrl) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(error => {
            console.error("Error playing Vera audio on start:", error);
            setState(prev => ({ ...prev, audioError: true }));
          });
        }
      }, 100);
    }
  };

  const startWithMarco = () => {
    if (state.isActive && state.activeVoice === "marco") {
      setState(prev => ({
        ...prev,
        isActive: false,
        activeVoice: "none"
      }));
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } else {
      setState(prev => ({
        ...prev,
        activeVoice: "marco",
        isActive: true
      }));
      
      setTimeout(() => {
        if (audioRef.current && state.currentAudioUrl) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(error => {
            console.error("Error playing Marco audio on start:", error);
            setState(prev => ({ ...prev, audioError: true }));
          });
        }
      }, 100);
    }
  };

  const resetExercise = () => {
    if (!selectedPattern) return;
    
    setState({
      isActive: false,
      currentPhase: "inhale",
      currentCycle: 1,
      secondsLeft: selectedPattern.inhale,
      activeVoice: "none",
      audioError: false,
      currentAudioUrl: ""
    });
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    updateCurrentAudioUrl();
  };

  const handleAudioError = () => {
    setState(prev => ({ ...prev, audioError: true }));
  };

  return {
    state,
    audioRef,
    startWithVera,
    startWithMarco,
    resetExercise,
    handleAudioError,
    mapPhaseToCirclePhase: (phase: BreathingPhase): "inhale" | "hold" | "exhale" | "rest" => {
      switch (phase) {
        case "inhale": return "inhale";
        case "hold1": return "hold";
        case "exhale": return "exhale";
        case "hold2": return "hold";
        default: return "rest";
      }
    }
  };
}
