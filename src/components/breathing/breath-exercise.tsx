import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BreathingCircle } from "@/components/breathing-circle";
import { Button } from "@/components/ui/button";
import { Pause, Play, RefreshCw } from "lucide-react";
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
  
  // Track currently selected voice
  const [activeVoice, setActiveVoice] = useState<"none" | "vera" | "marco">("none");

  // Load breathing patterns and voice URLs from localStorage
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

  // Reset state when pattern changes
  useEffect(() => {
    setIsActive(false);
    setCurrentPhase("inhale");
    setCurrentCycle(1);
    setSecondsLeft(currentPattern.inhale);
    setAudioError(false);
    
    updateCurrentAudioUrl();
  }, [currentPattern]);
  
  // Update audio URL based on current phase and active voice
  const updateCurrentAudioUrl = () => {
    let url = "";
    
    if (activeVoice === "vera") {
      // Get Vera URLs from localStorage
      const veraUrls = localStorage.getItem('veraVoiceUrls');
      if (veraUrls) {
        try {
          const parsedUrls = JSON.parse(veraUrls);
          switch (currentPhase) {
            case "inhale":
              url = parsedUrls.inhale || "";
              break;
            case "hold1":
            case "hold2":
              url = parsedUrls.hold || "";
              break;
            case "exhale":
              url = parsedUrls.exhale || "";
              break;
          }
        } catch (error) {
          console.error("Error parsing Vera URLs:", error);
        }
      }
    } else if (activeVoice === "marco") {
      // Get Marco URLs from localStorage
      const marcoUrls = localStorage.getItem('marcoVoiceUrls');
      if (marcoUrls) {
        try {
          const parsedUrls = JSON.parse(marcoUrls);
          switch (currentPhase) {
            case "inhale":
              url = parsedUrls.inhale || "";
              break;
            case "hold1":
            case "hold2":
              url = parsedUrls.hold || "";
              break;
            case "exhale":
              url = parsedUrls.exhale || "";
              break;
          }
        } catch (error) {
          console.error("Error parsing Marco URLs:", error);
        }
      }
    } else {
      // Default to pattern URLs if no voice is selected
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
    }
    
    setCurrentAudioUrl(url);
    setAudioError(false);
  };

  // Update and play audio when phase changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    updateCurrentAudioUrl();
    
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
          });
        }
      };
      
      setTimeout(playAudio, 100);
    }
  }, [currentPhase, currentPattern, isActive, currentAudioUrl, activeVoice]);

  // Breathing timer effect
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

  // Stop audio when exercise is paused
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
        return "Houd vast";
      case "exhale":
        return "Uitademen";
      case "hold2":
        return "Houd vast";
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
    
    updateCurrentAudioUrl();
  };

  const startWithVera = () => {
    if (isActive && activeVoice === "vera") {
      setIsActive(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } else {
      setActiveVoice("vera");
      setIsActive(true);
      
      setTimeout(() => {
        if (audioRef.current && currentAudioUrl) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(error => {
            console.error("Error playing Vera audio on start:", error);
            setAudioError(true);
          });
        }
      }, 100);
    }
  };

  const startWithMarco = () => {
    if (isActive && activeVoice === "marco") {
      setIsActive(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } else {
      setActiveVoice("marco");
      setIsActive(true);
      
      setTimeout(() => {
        if (audioRef.current && currentAudioUrl) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(error => {
            console.error("Error playing Marco audio on start:", error);
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

  const getCurrentPhaseLabel = () => {
    switch (currentPhase) {
      case "inhale": return "Inademen";
      case "hold1": return "Vasthouden";
      case "exhale": return "Uitademen";
      case "hold2": return "Vasthouden";
      default: return "";
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
      
      <Card className="overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 border-none shadow-xl">
        <CardContent className="p-6">
          <div className="mb-4">
            <Select
              value={currentPattern.id}
              onValueChange={handlePatternChange}
              disabled={isActive}
            >
              <SelectTrigger className="w-full bg-black/20 border-white/10">
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
          
          <div className="flex flex-col items-center justify-center space-y-6 py-6">
            <div className="relative h-48 w-48 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
              <div className="text-white text-center">
                <div className="text-6xl font-bold mb-1">{secondsLeft}</div>
                <div className="text-xl font-medium">{getCurrentPhaseLabel()}</div>
              </div>
            </div>
            
            <div className="text-center space-y-1 text-white">
              <p className="text-blue-200">
                {currentAudioUrl && !audioError ? "Audio speelt af" : ""}
              </p>
              <p className="text-sm text-white/70">
                Cyclus {currentCycle} van {currentPattern.cycles}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-2">
              <Button 
                onClick={startWithVera} 
                variant={isActive && activeVoice === "vera" ? "secondary" : "default"}
                size="lg"
                className="w-full bg-blue-500 hover:bg-blue-600 border-none"
              >
                {isActive && activeVoice === "vera" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                Start Vera
              </Button>
              
              <Button 
                onClick={startWithMarco} 
                variant={isActive && activeVoice === "marco" ? "secondary" : "default"}
                size="lg"
                className="w-full bg-blue-500 hover:bg-blue-600 border-none"
              >
                {isActive && activeVoice === "marco" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                Start Marco
              </Button>
            </div>
            
            <Button 
              onClick={resetExercise} 
              variant="outline"
              size="sm"
              className="mt-2 text-white/80 border-white/20 hover:bg-white/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
