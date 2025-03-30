
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
import { BreathingPattern } from "@/lib/types";

export function BreathExercise() {
  // Default breathing patterns
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

  // State
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
  
  // Voice URLs
  const [veraVoiceUrls, setVeraVoiceUrls] = useState<{inhale: string, hold: string, exhale: string}>({
    inhale: "",
    hold: "",
    exhale: ""
  });
  
  const [marcoVoiceUrls, setMarcoVoiceUrls] = useState<{inhale: string, hold: string, exhale: string}>({
    inhale: "",
    hold: "",
    exhale: ""
  });

  // Load breathing patterns and voice URLs from localStorage
  useEffect(() => {
    // Load breathing patterns
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
    
    // Load voice URLs
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
      // Use Vera voice URLs
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
      // Use Marco voice URLs
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
    setActiveVoice("none");
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    updateCurrentAudioUrl();
  };

  const startWithVera = () => {
    if (isActive && activeVoice === "vera") {
      setIsActive(false);
      setActiveVoice("none");
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
      setActiveVoice("none");
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
          
          <BreathingCircle
            isActive={isActive}
            currentPhase={mapPhaseToCirclePhase(currentPhase)}
            secondsLeft={secondsLeft}
            inhaleDuration={currentPattern.inhale * 1000}
            holdDuration={currentPattern.hold1 * 1000}
            exhaleDuration={currentPattern.exhale * 1000}
          />
          
          <div className="text-center space-y-1 text-white mt-4">
            <p className="text-sm text-white/70">
              Cyclus {currentCycle} van {currentPattern.cycles}
            </p>
            {currentAudioUrl && !audioError ? (
              <p className="text-blue-200">Audio speelt af</p>
            ) : null}
          </div>
          
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs mx-auto mt-6">
            <Button 
              onClick={startWithVera} 
              variant={isActive && activeVoice === "vera" ? "secondary" : "default"}
              size="lg"
              className="w-full bg-blue-500 hover:bg-blue-600 border-none"
            >
              {isActive && activeVoice === "vera" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              Vera
            </Button>
            
            <Button 
              onClick={startWithMarco} 
              variant={isActive && activeVoice === "marco" ? "secondary" : "default"}
              size="lg"
              className="w-full bg-blue-500 hover:bg-blue-600 border-none"
            >
              {isActive && activeVoice === "marco" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              Marco
            </Button>
          </div>
          
          <div className="flex justify-center mt-3">
            <Button 
              onClick={resetExercise} 
              variant="outline"
              size="sm"
              className="text-white/80 border-white/20 hover:bg-white/10"
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
