import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BreathingCircle } from "@/components/breathing-circle";
import { Button } from "@/components/ui/button";
import { Pause, Play, RefreshCw, Link } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";

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
};

const defaultBreathingPatterns: BreathingPattern[] = [
  {
    id: "1",
    name: "4-7-8 Techniek",
    description: "Een kalmerende ademhalingstechniek die helpt bij ontspanning",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 5,
  },
  {
    id: "2",
    name: "Box Breathing",
    description: "Vierkante ademhaling voor focus en kalmte",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4, 
    cycles: 4,
  },
  {
    id: "3",
    name: "Relaxerende Ademhaling",
    description: "Eenvoudige techniek voor diepe ontspanning",
    inhale: 4,
    hold1: 2,
    exhale: 6,
    hold2: 0,
    cycles: 6,
  },
];

export function BreathExercise() {
  const [breathingPatterns, setBreathingPatterns] = useState<BreathingPattern[]>(defaultBreathingPatterns);
  const [currentPattern, setCurrentPattern] = useState<BreathingPattern>(breathingPatterns[0]);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale");
  const [currentCycle, setCurrentCycle] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>("");
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    const savedPatterns = localStorage.getItem('breathingPatterns');
    if (savedPatterns) {
      try {
        const parsedPatterns = JSON.parse(savedPatterns);
        const mergedPatterns = [...defaultBreathingPatterns];
        
        parsedPatterns.forEach((pattern: BreathingPattern) => {
          if (!mergedPatterns.some(p => p.id === pattern.id)) {
            mergedPatterns.push(pattern);
          }
        });
        
        setBreathingPatterns(mergedPatterns);
        if (mergedPatterns.length > 0) {
          setCurrentPattern(mergedPatterns[0]);
        }
      } catch (error) {
        console.error("Error loading breathing patterns:", error);
      }
    }
  }, []);

  useEffect(() => {
    setIsActive(false);
    setCurrentPhase("inhale");
    setCurrentCycle(1);
    setSecondsLeft(currentPattern.inhale);
    setAudioError(false);
    
    setCurrentAudioUrl(currentPattern.inhaleUrl || "");
  }, [currentPattern]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    let url = "";
    switch (currentPhase) {
      case "inhale":
        url = currentPattern.inhaleUrl || "";
        break;
      case "hold1":
        url = currentPattern.hold1Url || "";
        break;
      case "exhale":
        url = currentPattern.exhaleUrl || "";
        break;
      case "hold2":
        url = currentPattern.hold2Url || "";
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
          });
        }
      };
      
      setTimeout(playAudio, 100);
    }
  }, [currentPhase, currentPattern, isActive]);

  useEffect(() => {
    let timer: number | null = null;
    
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
            setSecondsLeft(currentPattern.hold1 || 1);
          } else if (currentPhase === "hold1") {
            setCurrentPhase("exhale");
            setSecondsLeft(currentPattern.exhale);
          } else if (currentPhase === "exhale") {
            if (currentPattern.hold2) {
              setCurrentPhase("hold2");
              setSecondsLeft(currentPattern.hold2);
            } else {
              if (currentCycle < currentPattern.cycles) {
                setCurrentCycle(cycle => cycle + 1);
                setCurrentPhase("inhale");
                setSecondsLeft(currentPattern.inhale);
              } else {
                setIsActive(false);
                setCurrentCycle(1);
                setCurrentPhase("inhale");
                setSecondsLeft(currentPattern.inhale);
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                }
                toast.success("Ademhalingsoefening voltooid!");
              }
            }
          } else if (currentPhase === "hold2") {
            if (currentCycle < currentPattern.cycles) {
              setCurrentCycle(cycle => cycle + 1);
              setCurrentPhase("inhale");
              setSecondsLeft(currentPattern.inhale);
            } else {
              setIsActive(false);
              setCurrentCycle(1);
              setCurrentPhase("inhale");
              setSecondsLeft(currentPattern.inhale);
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
              toast.success("Ademhalingsoefening voltooid!");
            }
          }
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, currentPhase, secondsLeft, currentCycle, currentPattern]);

  useEffect(() => {
    if (!isActive && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isActive]);

  const mapPhaseToCirclePhase = (phase: "inhale" | "hold1" | "exhale" | "hold2"): "inhale" | "hold" | "exhale" | "rest" => {
    switch (phase) {
      case "inhale": return "inhale";
      case "hold1": return "hold";
      case "exhale": return "exhale";
      case "hold2": return "hold";
      default: return "rest";
    }
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
    setIsActive(false);
    setCurrentPhase("inhale");
    setCurrentCycle(1);
    setSecondsLeft(currentPattern.inhale);
    setAudioError(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    setCurrentAudioUrl(currentPattern.inhaleUrl || "");
  };

  const toggleExercise = () => {
    setIsActive(!isActive);
    
    if (!isActive && audioRef.current && currentAudioUrl) {
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(error => {
            console.error("Error playing audio on start:", error);
            setAudioError(true);
          });
        }
      }, 100);
    }
  };

  const handlePatternChange = (value: string) => {
    const selectedPattern = breathingPatterns.find(pattern => pattern.id === value);
    if (selectedPattern) {
      setCurrentPattern(selectedPattern);
    }
  };

  const hasAudioForCurrentPhase = () => {
    switch (currentPhase) {
      case "inhale":
        return !!currentPattern.inhaleUrl;
      case "hold1":
        return !!currentPattern.hold1Url;
      case "exhale":
        return !!currentPattern.exhaleUrl;
      case "hold2":
        return !!currentPattern.hold2Url;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <RefreshCw className="text-primary h-5 w-5" />
        <h2 className="text-lg font-medium">Ademhalingsoefening</h2>
      </div>
      
      <audio 
        ref={audioRef} 
        src={currentAudioUrl} 
        preload="auto" 
        onError={() => setAudioError(true)} 
      />
      
      <Card className="bg-gradient-to-br from-blue-100/30 via-indigo-100/30 to-purple-100/30 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-purple-900/10 backdrop-blur-sm border border-white/20 dark:border-white/5">
        <CardContent className="p-4">
          <div className="mb-4">
            <Select
              value={currentPattern.id}
              onValueChange={handlePatternChange}
              disabled={isActive}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecteer een ademhalingstechniek" />
              </SelectTrigger>
              <SelectContent>
                {breathingPatterns.map((pattern) => (
                  <SelectItem key={pattern.id} value={pattern.id}>
                    {pattern.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-6 py-4">
            <BreathingCircle 
              inhaleDuration={currentPattern.inhale * 1000}
              holdDuration={currentPattern.hold1 * 1000}
              exhaleDuration={currentPattern.exhale * 1000}
              onBreathComplete={() => {}}
              isActive={isActive}
              currentPhase={mapPhaseToCirclePhase(currentPhase)}
            />
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <p className="text-2xl font-medium">{getInstructions()}</p>
                {hasAudioForCurrentPhase() && (
                  <span className={`${audioError ? "text-red-500" : "text-primary"}`}>
                    <Link className="h-4 w-4" />
                  </span>
                )}
              </div>
              <p className="text-xl">{secondsLeft}</p>
              <p className="text-sm text-muted-foreground">
                Cyclus {currentCycle} van {currentPattern.cycles}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={toggleExercise} 
                variant="default"
                size="lg"
                className="w-32"
              >
                {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {isActive ? "Pauze" : "Start"}
              </Button>
              
              <Button 
                onClick={resetExercise} 
                variant="outline"
                size="lg"
                className="w-32"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
