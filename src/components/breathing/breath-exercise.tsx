
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

// Sample data - this would ideally come from API/database in a real app
// We'll use the same data structure as the admin panel to ensure consistency
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
  // In a real app, this would be fetched from a database/API
  // Additional breathing patterns added in the admin panel would appear here
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
  
  // Load breathing patterns from localStorage when component mounts
  useEffect(() => {
    const savedPatterns = localStorage.getItem('breathingPatterns');
    if (savedPatterns) {
      try {
        const parsedPatterns = JSON.parse(savedPatterns);
        // Merge default patterns with saved patterns
        const mergedPatterns = [...defaultBreathingPatterns];
        
        // Add any patterns from localStorage that aren't in defaults
        parsedPatterns.forEach((pattern: BreathingPattern) => {
          if (!mergedPatterns.some(p => p.id === pattern.id)) {
            mergedPatterns.push(pattern);
          }
        });
        
        setBreathingPatterns(mergedPatterns);
        // Set the current pattern to the first one if it exists
        if (mergedPatterns.length > 0) {
          setCurrentPattern(mergedPatterns[0]);
        }
      } catch (error) {
        console.error("Error loading breathing patterns:", error);
      }
    }
  }, []);
  
  useEffect(() => {
    // Reset state when pattern changes
    setIsActive(false);
    setCurrentPhase("inhale");
    setCurrentCycle(1);
    setSecondsLeft(currentPattern.inhale);
    
    // If there's an audio URL for inhale, set it as the current audio URL
    setCurrentAudioUrl(currentPattern.inhaleUrl || "");
  }, [currentPattern]);
  
  // Handle audio playback for each phase
  useEffect(() => {
    if (audioRef.current) {
      // Stop current audio if it's playing
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      // Get the correct URL for the current phase
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
      
      // Set the new URL and play if active
      setCurrentAudioUrl(url);
      if (url && isActive) {
        audioRef.current.src = url;
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Error playing audio:", error);
            toast.error("Kan audio niet afspelen. Controleer de URL.");
          });
        }
      }
    }
  }, [currentPhase, isActive, currentPattern]);
  
  // Play/pause audio when exercise is toggled
  useEffect(() => {
    if (audioRef.current) {
      if (isActive && currentAudioUrl) {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isActive, currentAudioUrl]);
  
  useEffect(() => {
    let timer: number | null = null;
    
    if (isActive) {
      timer = window.setInterval(() => {
        if (secondsLeft > 1) {
          setSecondsLeft(seconds => seconds - 1);
        } else {
          // Move to next phase
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
              // If no hold2, go to next cycle or finish
              if (currentCycle < currentPattern.cycles) {
                setCurrentCycle(cycle => cycle + 1);
                setCurrentPhase("inhale");
                setSecondsLeft(currentPattern.inhale);
              } else {
                // Exercise complete
                setIsActive(false);
                setCurrentCycle(1);
                setCurrentPhase("inhale");
                setSecondsLeft(currentPattern.inhale);
              }
            }
          } else if (currentPhase === "hold2") {
            // Cycle completed, start next or finish
            if (currentCycle < currentPattern.cycles) {
              setCurrentCycle(cycle => cycle + 1);
              setCurrentPhase("inhale");
              setSecondsLeft(currentPattern.inhale);
            } else {
              // Exercise complete
              setIsActive(false);
              setCurrentCycle(1);
              setCurrentPhase("inhale");
              setSecondsLeft(currentPattern.inhale);
            }
          }
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, currentPhase, secondsLeft, currentCycle, currentPattern]);
  
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
    
    // Reset audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
  
  const toggleExercise = () => {
    setIsActive(!isActive);
  };

  const handlePatternChange = (value: string) => {
    const selectedPattern = breathingPatterns.find(pattern => pattern.id === value);
    if (selectedPattern) {
      setCurrentPattern(selectedPattern);
    }
  };
  
  // Check if the current phase has an audio URL
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
      
      {/* Hidden audio element for playing sound */}
      <audio ref={audioRef} src={currentAudioUrl} preload="auto" />
      
      <Card className="bg-card/60 backdrop-blur-sm">
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
            />
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <p className="text-2xl font-medium">{getInstructions()}</p>
                {hasAudioForCurrentPhase() && (
                  <span className="text-primary">
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
