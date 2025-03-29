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

interface BreathExerciseProps {
  breathingPatterns: BreathingPattern[];
  selectedPattern: BreathingPattern | null;
  onPatternChange: (patternId: string) => void;
}

export function BreathExercise({ 
  breathingPatterns, 
  selectedPattern, 
  onPatternChange 
}: BreathExerciseProps) {
  // State
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
    
    setIsActive(false);
    setCurrentPhase("inhale");
    setCurrentCycle(1);
    setSecondsLeft(selectedPattern.inhale);
    setAudioError(false);
    
    updateCurrentAudioUrl();
  }, [selectedPattern]);
  
  // Update audio URL based on current phase and active voice
  const updateCurrentAudioUrl = () => {
    if (!selectedPattern) return;
    
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
    
    setCurrentAudioUrl(url);
    setAudioError(false);
  };

  // Update and play audio when phase changes
  useEffect(() => {
    if (!selectedPattern || !audioRef.current) return;
    
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
  }, [currentPhase, selectedPattern, isActive, currentAudioUrl, activeVoice]);

  // Breathing timer effect
  useEffect(() => {
    if (!selectedPattern) return;
    
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
            setSecondsLeft(selectedPattern.hold1 || 1);
          } else if (currentPhase === "hold1") {
            setCurrentPhase("exhale");
            setSecondsLeft(selectedPattern.exhale);
          } else if (currentPhase === "exhale") {
            if (selectedPattern.hold2) {
              setCurrentPhase("hold2");
              setSecondsLeft(selectedPattern.hold2);
            } else {
              if (currentCycle < selectedPattern.cycles) {
                setCurrentCycle(cycle => cycle + 1);
                setCurrentPhase("inhale");
                setSecondsLeft(selectedPattern.inhale);
              } else {
                setIsActive(false);
                setCurrentCycle(1);
                setCurrentPhase("inhale");
                setSecondsLeft(selectedPattern.inhale);
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                }
                toast.success("Ademhalingsoefening voltooid!");
              }
            }
          } else if (currentPhase === "hold2") {
            if (currentCycle < selectedPattern.cycles) {
              setCurrentCycle(cycle => cycle + 1);
              setCurrentPhase("inhale");
              setSecondsLeft(selectedPattern.inhale);
            } else {
              setIsActive(false);
              setCurrentCycle(1);
              setCurrentPhase("inhale");
              setSecondsLeft(selectedPattern.inhale);
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
  }, [isActive, currentPhase, secondsLeft, currentCycle, selectedPattern]);

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
    if (!selectedPattern) return;
    
    setIsActive(false);
    setCurrentPhase("inhale");
    setCurrentCycle(1);
    setSecondsLeft(selectedPattern.inhale);
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

  if (!selectedPattern || breathingPatterns.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Geen ademhalingstechnieken beschikbaar.
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <audio 
        ref={audioRef} 
        src={currentAudioUrl} 
        preload="auto" 
        onError={() => setAudioError(true)} 
      />
      
      <Card className="overflow-hidden bg-navy-900 border-none shadow-xl">
        <CardContent className="p-6">
          <div className="mb-4">
            <Select
              value={selectedPattern.id}
              onValueChange={onPatternChange}
              disabled={isActive}
            >
              <SelectTrigger className="w-full bg-black/20 border-white/10 text-white">
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
            inhaleDuration={selectedPattern.inhale * 1000}
            holdDuration={selectedPattern.hold1 * 1000}
            exhaleDuration={selectedPattern.exhale * 1000}
          />
          
          <div className="text-center space-y-1 text-white mt-4">
            <p className="text-sm text-white/70">
              Cyclus {currentCycle} van {selectedPattern.cycles}
            </p>
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
