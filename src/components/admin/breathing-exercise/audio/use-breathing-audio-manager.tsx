
import { useState, useEffect, useCallback } from "react";
import { BreathingPattern } from "@/lib/types";
import { BreathingExerciseState } from "../types";
import { useVoiceUrlLoader } from "./voice-url-loader";
import { useAudioElementManager } from "./audio-element-manager";
import { toast } from "sonner";

interface UseBreathingAudioManagerProps {
  pattern: BreathingPattern;
  state: BreathingExerciseState;
  setState: React.Dispatch<React.SetStateAction<BreathingExerciseState>>;
}

export function useBreathingAudioManager({ 
  pattern, 
  state, 
  setState 
}: UseBreathingAudioManagerProps) {
  const { 
    isActive, 
    currentPhase, 
    currentCycle, 
    secondsLeft, 
    exerciseCompleted, 
    activeVoice,
    currentAudioUrl
  } = state;
  
  const { veraVoiceUrls, marcoVoiceUrls } = useVoiceUrlLoader();
  const { audioRef, endAudioRef, playEndAudio } = useAudioElementManager();

  // Handle audio error
  const handleAudioError = useCallback(() => {
    setState(prevState => ({...prevState, audioError: true}));
  }, [setState]);

  // Update audio URL based on current phase and active voice
  useEffect(() => {
    if (!pattern) return;
    
    let url = "";
    if (activeVoice === "vera") {
      switch (currentPhase) {
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
    } else if (activeVoice === "marco") {
      switch (currentPhase) {
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
      switch (currentPhase) {
        case "inhale":
          url = pattern.inhaleUrl || "";
          break;
        case "hold1":
          url = pattern.hold1Url || "";
          break;
        case "exhale":
          url = pattern.exhaleUrl || "";
          break;
        case "hold2":
          url = pattern.hold2Url || "";
          break;
      }
    }
    
    if (url !== currentAudioUrl) {
      console.log(`Updating audio URL for ${currentPhase} phase:`, url);
      setState(prevState => ({
        ...prevState,
        currentAudioUrl: url,
        audioError: false
      }));
    }
  }, [currentPhase, activeVoice, pattern, veraVoiceUrls, marcoVoiceUrls, setState, currentAudioUrl]);

  // Manage circle scaling
  useEffect(() => {
    if (!isActive || !pattern) return;
    if (currentPhase === "inhale") {
      const inhaleProgress = (pattern.inhale - secondsLeft) / pattern.inhale;
      setState(prevState => ({...prevState, circleScale: 1 + inhaleProgress * 0.5}));
    } else if (currentPhase === "exhale") {
      const exhaleProgress = (pattern.exhale - secondsLeft) / pattern.exhale;
      setState(prevState => ({...prevState, circleScale: 1.5 - exhaleProgress * 0.5}));
    }
  }, [currentPhase, secondsLeft, isActive, pattern, setState]);

  // Main exercise timer and phase transitions
  useEffect(() => {
    if (!pattern) return;
    let timer: number | null = null;
    let progressTimer: number | null = null;
    
    if (isActive && !exerciseCompleted) {
      timer = window.setInterval(() => {
        if (secondsLeft > 1) {
          setState(prevState => ({...prevState, secondsLeft: prevState.secondsLeft - 1}));
        } else {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          
          if (currentPhase === "inhale") {
            if (pattern.hold1 > 0) {
              setState(prevState => ({
                ...prevState, 
                currentPhase: "hold1",
                secondsLeft: pattern.hold1,
                progress: 0,
                circleScale: 1.5
              }));
            } else {
              setState(prevState => ({
                ...prevState, 
                currentPhase: "exhale",
                secondsLeft: pattern.exhale,
                progress: 0
              }));
            }
          } else if (currentPhase === "hold1") {
            setState(prevState => ({
              ...prevState, 
              currentPhase: "exhale",
              secondsLeft: pattern.exhale,
              progress: 0
            }));
          } else if (currentPhase === "exhale") {
            if (pattern.hold2 > 0) {
              setState(prevState => ({
                ...prevState, 
                currentPhase: "hold2",
                secondsLeft: pattern.hold2,
                progress: 0,
                circleScale: 1
              }));
            } else {
              if (currentCycle < pattern.cycles) {
                setState(prevState => ({
                  ...prevState, 
                  currentCycle: prevState.currentCycle + 1,
                  currentPhase: "inhale",
                  secondsLeft: pattern.inhale,
                  progress: 0,
                  circleScale: 1
                }));
              } else {
                completeExercise();
              }
            }
          } else if (currentPhase === "hold2") {
            if (currentCycle < pattern.cycles) {
              setState(prevState => ({
                ...prevState, 
                currentCycle: prevState.currentCycle + 1,
                currentPhase: "inhale",
                secondsLeft: pattern.inhale,
                progress: 0,
                circleScale: 1
              }));
            } else {
              completeExercise();
            }
          }
        }
      }, 1000);
      
      const getCurrentPhaseDuration = () => {
        switch (currentPhase) {
          case "inhale":
            return pattern.inhale;
          case "hold1":
            return pattern.hold1;
          case "exhale":
            return pattern.exhale;
          case "hold2":
            return pattern.hold2;
          default:
            return 1;
        }
      };
      
      const phaseDuration = getCurrentPhaseDuration() * 1000;
      const startTime = Date.now();
      progressTimer = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const calculatedProgress = elapsed / phaseDuration * 100;
        setState(prevState => ({
          ...prevState, 
          progress: Math.min(calculatedProgress, 100)
        }));
      }, 16);
    }
    
    return () => {
      if (timer) clearInterval(timer);
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [isActive, currentPhase, secondsLeft, currentCycle, pattern, exerciseCompleted, setState, audioRef]);

  // Complete exercise function
  const completeExercise = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isActive: false,
      currentCycle: 1,
      currentPhase: "inhale",
      secondsLeft: pattern?.inhale || 0,
      progress: 0,
      circleScale: 1,
      activeVoice: null,
      exerciseCompleted: true
    }));
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (pattern?.endUrl) {
      playEndAudio(pattern.endUrl);
    }
    
    toast.success("Test voltooid!");
  }, [pattern, setState, audioRef, playEndAudio]);

  // Play audio effects
  useEffect(() => {
    if (!isActive || !currentAudioUrl || !audioRef.current) return;
    
    try {
      const audio = audioRef.current;
      audio.pause();
      audio.currentTime = 0;
      audio.src = currentAudioUrl;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log("Audio playback started successfully");
        }).catch(error => {
          console.error("Error playing audio:", error);
          handleAudioError();
        });
      }
    } catch (error) {
      console.error("Error setting up audio playback:", error);
      handleAudioError();
    }
  }, [currentAudioUrl, isActive, handleAudioError]);

  return {
    audioRef,
    endAudioRef,
    handleAudioError,
    completeExercise
  };
}
