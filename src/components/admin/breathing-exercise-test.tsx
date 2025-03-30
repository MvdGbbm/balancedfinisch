
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { BreathingExerciseTestProps } from "@/components/breathing/types";

export function BreathingExerciseTest({
  pattern
}: BreathingExerciseTestProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale");
  const [currentCycle, setCurrentCycle] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>("");
  const [audioError, setAudioError] = useState(false);
  const [activeVoice, setActiveVoice] = useState<"vera" | "marco" | null>(null);
  const [circleScale, setCircleScale] = useState(1);
  const [veraVoiceUrls, setVeraVoiceUrls] = useState<{
    inhale: string;
    hold: string;
    exhale: string;
  }>({
    inhale: "",
    hold: "",
    exhale: ""
  });
  const [marcoVoiceUrls, setMarcoVoiceUrls] = useState<{
    inhale: string;
    hold: string;
    exhale: string;
  }>({
    inhale: "",
    hold: "",
    exhale: ""
  });
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const endAudioRef = useRef<HTMLAudioElement | null>(null);
  
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
      setCurrentAudioUrl(pattern.inhaleUrl || "");
    }
  }, [pattern]);
  
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
    setCurrentAudioUrl(url);
    setAudioError(false);
  }, [currentPhase, activeVoice, pattern, veraVoiceUrls, marcoVoiceUrls]);
  
  useEffect(() => {
    if (!pattern || !audioRef.current) return;
    if (currentAudioUrl && isActive) {
      // Skip playing audio for hold phases if their duration is 0
      if ((currentPhase === "hold1" && pattern.hold1 <= 0) || 
          (currentPhase === "hold2" && pattern.hold2 <= 0)) {
        console.log(`Skipping ${currentPhase} audio because duration is 0`);
        return;
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current.src = currentAudioUrl;
      audioRef.current.load();
      const playAudio = () => {
        if (audioRef.current && isActive) {
          audioRef.current.play().catch(error => {
            console.error("Error playing audio:", error);
            setAudioError(true);
            toast.error("Kan audio niet afspelen. Controleer de URL.");
          });
        }
      };
      setTimeout(playAudio, 100);
    }
  }, [currentAudioUrl, isActive, pattern, currentPhase]);
  
  useEffect(() => {
    if (!isActive && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isActive]);
  
  useEffect(() => {
    if (!isActive || !pattern) return;
    if (currentPhase === "inhale") {
      const inhaleProgress = (pattern.inhale - secondsLeft) / pattern.inhale;
      setCircleScale(1 + inhaleProgress * 0.5);
    } else if (currentPhase === "exhale") {
      const exhaleProgress = (pattern.exhale - secondsLeft) / pattern.exhale;
      setCircleScale(1.5 - exhaleProgress * 0.5);
    }
  }, [currentPhase, secondsLeft, isActive, pattern]);
  
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
            // Skip hold1 phase if hold1 duration is 0
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
            // Skip hold2 phase if hold2 duration is 0
            if (pattern.hold2 <= 0) {
              if (currentCycle < pattern.cycles) {
                setCurrentCycle(cycle => cycle + 1);
                setCurrentPhase("inhale");
                setSecondsLeft(pattern.inhale);
                setProgress(0);
                setCircleScale(1);
              } else {
                completeExercise();
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
        setProgress(Math.min(calculatedProgress, 100));
      }, 16);
    }
    
    return () => {
      if (timer) clearInterval(timer);
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [isActive, currentPhase, secondsLeft, currentCycle, pattern, exerciseCompleted]);
  
  const completeExercise = () => {
    setIsActive(false);
    setCurrentCycle(1);
    setCurrentPhase("inhale");
    setSecondsLeft(pattern?.inhale || 0);
    setProgress(0);
    setCircleScale(1);
    setActiveVoice(null);
    setExerciseCompleted(true);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (pattern?.endUrl) {
      try {
        if (endAudioRef.current) {
          endAudioRef.current.src = pattern.endUrl;
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
  
  const getInstructions = () => {
    if (!pattern) return "";
    
    switch (currentPhase) {
      case "inhale":
        return "Inademen";
      case "hold1":
        // Only show text if hold1 duration is > 0
        return pattern.hold1 > 0 ? "Vasthouden" : "";
      case "exhale":
        return "Uitademen";
      case "hold2":
        // Only show text if hold2 duration is > 0
        return pattern.hold2 > 0 ? "Vasthouden" : "";
      default:
        return "";
    }
  };
  
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
    setCurrentAudioUrl(pattern.inhaleUrl || "");
  };
  
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
  
  if (!pattern) {
    return <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Selecteer een ademhalingstechniek om te testen.
        </CardContent>
      </Card>;
  }
  
  return <Card>
      <CardHeader>
        <CardTitle>Test: {pattern.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <audio 
            ref={audioRef} 
            onError={() => setAudioError(true)} 
          />
          <audio ref={endAudioRef} />
          
          <div className="relative h-64 w-64 mb-6 flex items-center justify-center">
            <div 
              className="absolute inset-0 rounded-full bg-blue-400 opacity-20 blur-xl"
              style={{
                transform: `scale(${circleScale * 1.2})`,
                transition: 'transform 0.5s ease-in-out'
              }}
            />
            
            <div 
              className="absolute inset-0 flex items-center justify-center rounded-full"
              style={{
                transform: `scale(${circleScale})`,
                transition: 'transform 0.5s ease-in-out'
              }}
            >
              <div className="h-full w-full rounded-full flex items-center justify-center bg-blue-500 text-white">
                <div className="text-center p-4">
                  {getInstructions() && (
                    <div className="text-xl font-medium mb-2">{getInstructions()}</div>
                  )}
                  <div className="text-4xl font-bold">{secondsLeft}</div>
                </div>
              </div>
            </div>
          </div>
          
          <Progress value={progress} className="w-64 h-2 mb-4" />
          
          <div className="text-center mb-8">
            <p className="text-lg">Cyclus {currentCycle} van {pattern.cycles}</p>
            {audioError && (
              <p className="text-red-500 text-sm mt-1">Fout bij het afspelen van audio</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            <Button 
              onClick={startWithVera} 
              variant={isActive && activeVoice === "vera" ? "secondary" : "default"}
              className="w-full"
            >
              {isActive && activeVoice === "vera" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              Vera Stem
            </Button>
            
            <Button 
              onClick={startWithMarco} 
              variant={isActive && activeVoice === "marco" ? "secondary" : "default"}
              className="w-full"
            >
              {isActive && activeVoice === "marco" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              Marco Stem
            </Button>
          </div>
          
          <Button 
            onClick={resetExercise} 
            variant="outline" 
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>;
}
