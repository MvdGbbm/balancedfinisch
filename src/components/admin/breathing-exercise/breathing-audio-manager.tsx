
import React, { useState, useEffect, useRef } from "react";
import { BreathingPattern } from "@/lib/types";
import { BreathingExerciseState, VoiceUrls } from "./types";
import { toast } from "sonner";

interface BreathingAudioManagerProps {
  pattern: BreathingPattern;
  state: BreathingExerciseState;
  setState: React.Dispatch<React.SetStateAction<BreathingExerciseState>>;
}

export function BreathingAudioManager({ 
  pattern, 
  state, 
  setState 
}: BreathingAudioManagerProps) {
  const { 
    isActive, 
    currentPhase, 
    currentCycle, 
    secondsLeft, 
    exerciseCompleted, 
    activeVoice,
    currentAudioUrl
  } = state;
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endAudioRef = useRef<HTMLAudioElement | null>(null);
  const [veraVoiceUrls, setVeraVoiceUrls] = useState<VoiceUrls>({
    inhale: "",
    hold: "",
    exhale: ""
  });
  const [marcoVoiceUrls, setMarcoVoiceUrls] = useState<VoiceUrls>({
    inhale: "",
    hold: "",
    exhale: ""
  });

  // Improved loading of voice URLs with better error handling
  useEffect(() => {
    try {
      const savedVeraUrls = localStorage.getItem('veraVoiceUrls');
      if (savedVeraUrls) {
        const parsedUrls = JSON.parse(savedVeraUrls);
        console.log("Loaded Vera voice URLs in audio manager:", parsedUrls);
        setVeraVoiceUrls(parsedUrls);
      }
      
      const savedMarcoUrls = localStorage.getItem('marcoVoiceUrls');
      if (savedMarcoUrls) {
        const parsedUrls = JSON.parse(savedMarcoUrls);
        console.log("Loaded Marco voice URLs in audio manager:", parsedUrls);
        setMarcoVoiceUrls(parsedUrls);
      }
    } catch (error) {
      console.error("Error loading voice URLs:", error);
    }
  }, []);

  // Initialize audio elements and handle reference setup
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "auto";
      audio.addEventListener("error", (e) => {
        console.error("Audio error:", e);
        setState(prevState => ({...prevState, audioError: true}));
        toast.error("Fout bij het afspelen van audio. Controleer de URL.");
      });
      audio.addEventListener("canplaythrough", () => {
        console.log("Audio can play through completely:", audio.src);
      });
      audioRef.current = audio;
    }
    
    if (!endAudioRef.current) {
      const endAudio = new Audio();
      endAudio.preload = "auto";
      endAudio.addEventListener("error", (e) => {
        console.error("End audio error:", e);
        toast.error("Fout bij het afspelen van eind-audio.");
      });
      endAudioRef.current = endAudio;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (endAudioRef.current) {
        endAudioRef.current.pause();
        endAudioRef.current.src = "";
      }
    };
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

  // Play audio when URL changes with improved error handling
  useEffect(() => {
    if (!pattern || !audioRef.current || !isActive) return;
    
    if (!currentAudioUrl) {
      console.log(`No audio URL for ${currentPhase} phase, skipping playback`);
      return;
    }
    
    console.log("Attempting to play audio:", currentAudioUrl);
    
    try {
      const audio = audioRef.current;
      audio.pause();
      audio.currentTime = 0;
      audio.src = currentAudioUrl;
      
      // Add more explicit loading and error handling
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log("Audio playback started successfully");
        }).catch(error => {
          console.error("Error playing audio:", error);
          setState(prevState => ({...prevState, audioError: true}));
          toast.error("Fout bij het afspelen van audio. Probeer opnieuw.");
        });
      }
    } catch (error) {
      console.error("Error setting up audio playback:", error);
      setState(prevState => ({...prevState, audioError: true}));
      toast.error("Fout bij het instellen van audio. Controleer de URL.");
    }
  }, [currentAudioUrl, isActive, pattern, currentPhase, setState]);

  // Pause audio when exercise is stopped
  useEffect(() => {
    if (!isActive && audioRef.current) {
      console.log("Pausing audio as exercise is not active");
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isActive]);

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
  }, [isActive, currentPhase, secondsLeft, currentCycle, pattern, exerciseCompleted, setState]);

  const completeExercise = () => {
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
      try {
        if (endAudioRef.current) {
          console.log("Playing end audio:", pattern.endUrl);
          endAudioRef.current.src = pattern.endUrl;
          endAudioRef.current.load();
          const playPromise = endAudioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.error("Error playing end audio:", err);
              toast.error("Kon eind-audio niet afspelen");
            });
          }
        }
      } catch (error) {
        console.error("Error with end audio:", error);
      }
    }
    toast.success("Test voltooid!");
  };

  return (
    <>
      <audio ref={audioRef} style={{ display: 'none' }} />
      <audio ref={endAudioRef} style={{ display: 'none' }} />
    </>
  );
}
