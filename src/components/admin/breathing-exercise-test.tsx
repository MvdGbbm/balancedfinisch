
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

type BreathingPattern = {
  id: string;
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number;
  description?: string;
  inhaleUrl?: string;
  exhaleUrl?: string;
  hold1Url?: string;
  hold2Url?: string;
  endUrl?: string;
};

interface BreathingExerciseTestProps {
  pattern: BreathingPattern | null;
}

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
          // Only set the URL if it exists
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
          // Only set the URL if it exists
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
    
    // Skip audio playback if no URL is provided for this phase
    if (!currentAudioUrl && isActive) {
      console.log(`No audio URL for ${currentPhase} phase, skipping playback`);
      return;
    }
    
    if (currentAudioUrl && isActive) {
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
          // Always pause any playing audio before transitioning
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          
          if (currentPhase === "inhale") {
            // Only move to hold1 if there is a hold time
            if (pattern.hold1 > 0) {
              setCurrentPhase("hold1");
              setSecondsLeft(pattern.hold1);
              setProgress(0);
              setCircleScale(1.5);
            } else {
              // Skip hold1 if hold time is 0
              setCurrentPhase("exhale");
              setSecondsLeft(pattern.exhale);
              setProgress(0);
            }
          } else if (currentPhase === "hold1") {
            setCurrentPhase("exhale");
            setSecondsLeft(pattern.exhale);
            setProgress(0);
          } else if (currentPhase === "exhale") {
            if (pattern.hold2 > 0) {
              setCurrentPhase("hold2");
              setSecondsLeft(pattern.hold2);
              setProgress(0);
              setCircleScale(1);
            } else {
              // Manage cycle completion or exercise completion
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
          } else if (currentPhase === "hold2") {
            // Manage cycle completion or exercise completion
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
      
      // Progress animation
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
    switch (currentPhase) {
      case "inhale":
        return "Inademen";
      case "hold1":
        return "Vasthouden";
      case "exhale":
        return "Uitademen";
      case "hold2":
        return "Vasthouden";
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
      // Check if essential URLs are provided
      if (!veraVoiceUrls.inhale || !veraVoiceUrls.exhale) {
        toast.error("De Vera stem heeft minimaal inademings- en uitademings-URL's nodig");
        return;
      }
      
      setIsActive(true);
      setActiveVoice("vera");
      setExerciseCompleted(false);
      
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
      // Check if essential URLs are provided
      if (!marcoVoiceUrls.inhale || !marcoVoiceUrls.exhale) {
        toast.error("De Marco stem heeft minimaal inademings- en uitademings-URL's nodig");
        return;
      }
      
      setIsActive(true);
      setActiveVoice("marco");
      setExerciseCompleted(false);
      
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
        <CardHeader>
          <CardTitle>Test Ademhalingsoefening</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Selecteer eerst een ademhalingstechniek om te testen.</p>
        </CardContent>
      </Card>;
  }

  return <Card>
      <CardHeader>
        <CardTitle>Test Ademhalingsoefening: {pattern.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium">{getInstructions()}</h3>
              <p className="text-sm text-muted-foreground">
                Cyclus {currentCycle} van {pattern.cycles}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-mono">{secondsLeft}s</span>
            </div>
          </div>
          
          <Progress value={progress} className="h-2 mb-2" />
          
          <div className="flex justify-center my-8">
            <div 
              className="w-40 h-40 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center transition-all duration-1000"
              style={{ 
                transform: `scale(${circleScale})`,
                opacity: isActive ? 1 : 0.5,
              }}
            >
              <div className="text-center">
                <p className="text-lg font-semibold text-primary">
                  {!isActive ? "Start" : getInstructions()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Button 
              onClick={resetExercise} 
              disabled={!pattern}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            
            <Button 
              onClick={startWithVera} 
              disabled={!pattern || !(veraVoiceUrls.inhale && veraVoiceUrls.exhale)}
              variant={activeVoice === "vera" && isActive ? "destructive" : "default"}
              className="flex justify-center items-center"
            >
              {activeVoice === "vera" && isActive ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Stop Vera
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start met Vera
                </>
              )}
            </Button>
            
            <Button 
              onClick={startWithMarco} 
              disabled={!pattern || !(marcoVoiceUrls.inhale && marcoVoiceUrls.exhale)}
              variant={activeVoice === "marco" && isActive ? "destructive" : "default"}
              className="flex justify-center items-center"
            >
              {activeVoice === "marco" && isActive ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Stop Marco
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start met Marco
                </>
              )}
            </Button>
          </div>
          
          <div className="rounded-md bg-muted p-3 text-sm">
            <h4 className="font-medium mb-2">Patroon details:</h4>
            <ul className="space-y-1 list-disc pl-4">
              <li>Inademen: {pattern.inhale} seconden</li>
              <li>Vasthouden na inademen: {pattern.hold1} seconden {pattern.hold1 === 0 && "(wordt overgeslagen)"}</li>
              <li>Uitademen: {pattern.exhale} seconden</li>
              <li>Vasthouden na uitademen: {pattern.hold2} seconden {pattern.hold2 === 0 && "(wordt overgeslagen)"}</li>
              <li>Aantal cycli: {pattern.cycles}</li>
            </ul>
          </div>
        </div>
        
        <audio ref={audioRef} style={{ display: 'none' }} />
        <audio ref={endAudioRef} style={{ display: 'none' }} />
      </CardContent>
    </Card>;
}
