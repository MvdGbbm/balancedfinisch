
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { BreathingPattern, VoiceURLs } from "./types";

export function useBreathingTest(pattern: BreathingPattern | null) {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale");
  const [currentCycle, setCurrentCycle] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>("");
  const [audioError, setAudioError] = useState(false);
  const [activeVoice, setActiveVoice] = useState<"vera" | "marco" | null>(null);
  const [circleScale, setCircleScale] = useState(1);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endAudioRef = useRef<HTMLAudioElement | null>(null);
  const [veraVoiceUrls, setVeraVoiceUrls] = useState<VoiceURLs>({
    start: "",
    inhale: "",
    hold: "",
    exhale: "",
    end: ""
  });
  const [marcoVoiceUrls, setMarcoVoiceUrls] = useState<VoiceURLs>({
    start: "",
    inhale: "",
    hold: "",
    exhale: "",
    end: ""
  });

  // Load voice URLs from localStorage
  useEffect(() => {
    const savedVeraUrls = localStorage.getItem('veraVoiceUrls');
    if (savedVeraUrls) {
      try {
        const parsedUrls = JSON.parse(savedVeraUrls);
        setVeraVoiceUrls(parsedUrls);
      } catch (error) {
        console.error("Error loading Vera voice URLs:", error);
      }
    }
    
    const savedMarcoUrls = localStorage.getItem('marcoVoiceUrls');
    if (savedMarcoUrls) {
      try {
        const parsedUrls = JSON.parse(savedMarcoUrls);
        setMarcoVoiceUrls(parsedUrls);
      } catch (error) {
        console.error("Error loading Marco voice URLs:", error);
      }
    }
  }, []);

  // Reset state when pattern changes
  useEffect(() => {
    setIsActive(false);
    setCurrentPhase("inhale");
    setCurrentCycle(1);
    setAudioError(false);
    setProgress(0);
    setActiveVoice(null);
    setCircleScale(1);
    setExerciseCompleted(false);
    
    if (pattern) {
      setSecondsLeft(pattern.inhale);
    }
  }, [pattern]);

  // Update audio URL based on phase and voice
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
    }
    
    setCurrentAudioUrl(url);
    setAudioError(false);
  }, [currentPhase, activeVoice, pattern, veraVoiceUrls, marcoVoiceUrls]);

  // Main breathing timer effect
  useEffect(() => {
    if (!pattern) return;
    
    let timer: number | null = null;
    let progressTimer: number | null = null;
    
    if (isActive && !exerciseCompleted) {
      timer = window.setInterval(() => {
        if (secondsLeft > 1) {
          setSecondsLeft(seconds => seconds - 1);
        } else {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          
          if (currentPhase === "inhale") {
            // Skip hold1 phase if hold1 is 0 seconds or less
            if (pattern.hold1 <= 0) {
              setCurrentPhase("exhale");
              setSecondsLeft(pattern.exhale);
              setProgress(0);
            } else {
              setCurrentPhase("hold1");
              setSecondsLeft(pattern.hold1);
              setProgress(0);
              setCircleScale(1.5);
            }
          } else if (currentPhase === "hold1") {
            setCurrentPhase("exhale");
            setSecondsLeft(pattern.exhale);
            setProgress(0);
          } else if (currentPhase === "exhale") {
            // Skip hold2 phase if hold2 is 0 seconds or less
            if (pattern.hold2 <= 0) {
              if (currentCycle < pattern.cycles) {
                setCurrentCycle(cycle => cycle + 1);
                setCurrentPhase("inhale");
                setSecondsLeft(pattern.inhale);
                setProgress(0);
                setCircleScale(1);
              } else {
                completeExercise(pattern);
              }
            } else {
              setCurrentPhase("hold2");
              setSecondsLeft(pattern.hold2);
              setProgress(0);
              setCircleScale(1);
            }
          } else if (currentPhase === "hold2") {
            if (currentCycle < pattern.cycles) {
              setCurrentCycle(cycle => cycle + 1);
              setCurrentPhase("inhale");
              setSecondsLeft(pattern.inhale);
              setProgress(0);
              setCircleScale(1);
            } else {
              completeExercise(pattern);
            }
          }
        }
      }, 1000);
      
      // Progress bar animation
      const getCurrentPhaseDuration = () => {
        switch (currentPhase) {
          case "inhale": return pattern.inhale;
          case "hold1": return pattern.hold1;
          case "exhale": return pattern.exhale;
          case "hold2": return pattern.hold2;
          default: return 1;
        }
      };
      
      const phaseDuration = getCurrentPhaseDuration() * 1000;
      const startTime = Date.now();
      
      progressTimer = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const calculatedProgress = elapsed / phaseDuration * 100;
        setProgress(Math.min(calculatedProgress, 100));
      }, 16);
    }
    
    return () => {
      if (timer) clearInterval(timer);
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [isActive, currentPhase, secondsLeft, currentCycle, pattern, exerciseCompleted]);

  // Function to handle exercise completion
  const completeExercise = (pattern: BreathingPattern) => {
    setIsActive(false);
    setCurrentCycle(1);
    setCurrentPhase("inhale");
    setSecondsLeft(pattern.inhale);
    setProgress(0);
    setCircleScale(1);
    setActiveVoice(null);
    setExerciseCompleted(true);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Use voice-specific end audio if available
    const getEndAudioUrl = () => {
      if (activeVoice === "vera" && veraVoiceUrls.end) {
        return veraVoiceUrls.end;
      } else if (activeVoice === "marco" && marcoVoiceUrls.end) {
        return marcoVoiceUrls.end;
      }
      return "";
    };

    const endAudioUrl = getEndAudioUrl();
    
    if (endAudioUrl) {
      try {
        if (endAudioRef.current) {
          endAudioRef.current.src = endAudioUrl;
          endAudioRef.current.load();
          endAudioRef.current.play().catch(err => {
            console.error("Error playing end audio:", err);
          });
        }
      } catch (error) {
        console.error("Error with end audio:", error);
      }
    }
    
    toast.success("Test voltooid!");
  };

  // Function to reset the exercise
  const resetExercise = () => {
    if (!pattern) return;
    
    setIsActive(false);
    setCurrentPhase("inhale");
    setCurrentCycle(1);
    setSecondsLeft(pattern.inhale);
    setAudioError(false);
    setProgress(0);
    setActiveVoice(null);
    setCircleScale(1);
    setExerciseCompleted(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (endAudioRef.current) {
      endAudioRef.current.pause();
      endAudioRef.current.currentTime = 0;
    }
    
    setCurrentAudioUrl("");
  };

  // Function to start with Vera voice
  const startWithVera = () => {
    if (isActive && activeVoice === "vera") {
      setIsActive(false);
      setActiveVoice(null);
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } else {
      setIsActive(true);
      setActiveVoice("vera");
      
      setTimeout(() => {
        if (audioRef.current && currentAudioUrl) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(error => {
            console.error("Error playing audio with Vera:", error);
            setAudioError(true);
          });
        }
      }, 100);
    }
  };

  // Function to start with Marco voice
  const startWithMarco = () => {
    if (isActive && activeVoice === "marco") {
      setIsActive(false);
      setActiveVoice(null);
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } else {
      setIsActive(true);
      setActiveVoice("marco");
      
      setTimeout(() => {
        if (audioRef.current && currentAudioUrl) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(error => {
            console.error("Error playing audio with Marco:", error);
            setAudioError(true);
          });
        }
      }, 100);
    }
  };

  return {
    isActive,
    setIsActive,
    currentPhase,
    currentCycle,
    secondsLeft,
    progress,
    audioRef,
    endAudioRef,
    currentAudioUrl,
    audioError,
    activeVoice,
    circleScale,
    setCircleScale,
    exerciseCompleted,
    resetExercise,
    startWithVera,
    startWithMarco,
    totalCycles: pattern?.cycles || 0
  };
}
