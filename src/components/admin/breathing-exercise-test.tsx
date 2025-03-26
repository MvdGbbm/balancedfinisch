
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
  veraUrl?: string;
  marcoUrl?: string;
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

  useEffect(() => {
    setIsActive(false);
    setCurrentPhase("inhale");
    setCurrentCycle(1);
    setAudioError(false);
    setProgress(0);
    setActiveVoice(null);
    setCircleScale(1);
    if (pattern) {
      setSecondsLeft(pattern.inhale);
      setCurrentAudioUrl(pattern.inhaleUrl || "");
    }
  }, [pattern]);

  useEffect(() => {
    if (!pattern || !audioRef.current) return;

    let url = "";
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

    setCurrentAudioUrl(url);
    setAudioError(false);

    if (url && isActive) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      audioRef.current.src = url;
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
  }, [currentPhase, isActive, pattern]);

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
    } else if (currentPhase === "hold1" || currentPhase === "hold2") {
      setCircleScale(currentPhase === "hold1" ? 1.5 : 1.0);
    } else if (currentPhase === "exhale") {
      const exhaleProgress = (pattern.exhale - secondsLeft) / pattern.exhale;
      setCircleScale(1.5 - exhaleProgress * 0.5);
    }
  }, [currentPhase, secondsLeft, isActive, pattern]);

  useEffect(() => {
    if (!pattern) return;
    let timer: number | null = null;
    let progressTimer: number | null = null;
    if (isActive) {
      timer = window.setInterval(() => {
        if (secondsLeft > 1) {
          setSecondsLeft(seconds => seconds - 1);
        } else {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }

          if (currentPhase === "inhale") {
            setCurrentPhase("hold1");
            setSecondsLeft(pattern.hold1 || 1);
            setProgress(0);
            setCircleScale(1.5);
          } else if (currentPhase === "hold1") {
            setCurrentPhase("exhale");
            setSecondsLeft(pattern.exhale);
            setProgress(0);
          } else if (currentPhase === "exhale") {
            if (pattern.hold2) {
              setCurrentPhase("hold2");
              setSecondsLeft(pattern.hold2);
              setProgress(0);
              setCircleScale(1);
            } else {
              if (currentCycle < pattern.cycles) {
                setCurrentCycle(cycle => cycle + 1);
                setCurrentPhase("inhale");
                setSecondsLeft(pattern.inhale);
                setProgress(0);
                setCircleScale(1);
              } else {
                setIsActive(false);
                setCurrentCycle(1);
                setCurrentPhase("inhale");
                setSecondsLeft(pattern.inhale);
                setProgress(0);
                setCircleScale(1);
                setActiveVoice(null);
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                }
                toast.success("Test voltooid!");
              }
            }
          } else if (currentPhase === "hold2") {
            if (currentCycle < pattern.cycles) {
              setCurrentCycle(cycle => cycle + 1);
              setCurrentPhase("inhale");
              setSecondsLeft(pattern.inhale);
              setProgress(0);
              setCircleScale(1);
            } else {
              setIsActive(false);
              setCurrentCycle(1);
              setCurrentPhase("inhale");
              setSecondsLeft(pattern.inhale);
              setProgress(0);
              setCircleScale(1);
              setActiveVoice(null);
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
              toast.success("Test voltooid!");
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
  }, [isActive, currentPhase, secondsLeft, currentCycle, pattern]);

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

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
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

      const veraUrl = pattern?.veraUrl || currentAudioUrl;

      if (veraUrl) {
        if (audioRef.current) {
          audioRef.current.src = veraUrl;
          audioRef.current.load();
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(error => {
            console.error("Error playing audio with Vera:", error);
            setAudioError(true);
          });
        }
      }
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

      const marcoUrl = pattern?.marcoUrl || currentAudioUrl;

      if (marcoUrl) {
        if (audioRef.current) {
          audioRef.current.src = marcoUrl;
          audioRef.current.load();
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(error => {
            console.error("Error playing audio with Marco:", error);
            setAudioError(true);
          });
        }
      }
    }
  };

  if (!pattern) {
    return <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>Selecteer een ademhalingstechniek om deze te testen</p>
        </CardContent>
      </Card>;
  }

  return <Card>
      <CardHeader>
        <CardTitle>Testen: {pattern.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <audio ref={audioRef} src={currentAudioUrl} preload="auto" onError={() => setAudioError(true)} />
        
        <div className="flex flex-col items-center justify-center space-y-6 py-4">
          <div className="relative h-40 w-40 flex items-center justify-center">
            <div 
              className={`absolute inset-0 rounded-full transition-all duration-1000 ease-in-out
                ${currentPhase === "inhale" ? "bg-gradient-to-r from-blue-600 to-cyan-500" : 
                  currentPhase === "hold1" ? "bg-gradient-to-r from-purple-500 to-amber-400" : 
                  currentPhase === "exhale" ? "bg-gradient-to-r from-indigo-600 to-blue-500" : 
                  "bg-gradient-to-r from-blue-500 to-indigo-500"}`}
              style={{
                transform: `scale(${circleScale})`,
                transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white text-5xl font-bold">{secondsLeft}</p>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-2xl font-medium">{getInstructions()}</p>
            {currentAudioUrl && <p className={`text-xs ${audioError ? "text-red-500" : "text-primary"}`}>
                {audioError ? "Audio fout" : "Audio speelt af"}
              </p>}
            <p className="text-sm text-muted-foreground">
              Cyclus {currentCycle} van {pattern.cycles}
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Button 
              onClick={startWithVera} 
              variant={isActive && activeVoice === "vera" ? "secondary" : "default"} 
              size="lg"
            >
              {isActive && activeVoice === "vera" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              Vera
            </Button>
            
            <Button 
              onClick={startWithMarco} 
              variant={isActive && activeVoice === "marco" ? "secondary" : "default"} 
              size="lg"
            >
              {isActive && activeVoice === "marco" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              Marco
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>;
}
