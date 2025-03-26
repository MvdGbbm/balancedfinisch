import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { BreathingVisualization } from "@/components/breathing/breathing-visualization";
import { supabase } from "@/integrations/supabase/client";

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
  vera_url?: string;
  marco_url?: string;
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
  const [activeVoice, setActiveVoice] = useState<"none" | "vera" | "marco">("none");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchBreathingPatterns = async () => {
      try {
        const { data, error } = await supabase
          .from('breathing_patterns')
          .select('*');
          
        if (error) {
          console.error('Error fetching from Supabase:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          const mappedData = data.map(pattern => ({
            ...pattern,
            veraUrl: pattern.veraUrl || pattern.vera_url,
            marcoUrl: pattern.marcoUrl || pattern.marco_url
          }));
          setBreathingPatterns(mappedData);
          setCurrentPattern(mappedData[0]);
        } else {
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
              setBreathingPatterns(defaultBreathingPatterns);
              setCurrentPattern(defaultBreathingPatterns[0]);
            }
          } else {
            setBreathingPatterns(defaultBreathingPatterns);
            setCurrentPattern(defaultBreathingPatterns[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching patterns:', error);
        
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
            setBreathingPatterns(defaultBreathingPatterns);
            setCurrentPattern(defaultBreathingPatterns[0]);
          }
        } else {
          setBreathingPatterns(defaultBreathingPatterns);
          setCurrentPattern(defaultBreathingPatterns[0]);
        }
      }
    };

    fetchBreathingPatterns();
  }, []);

  useEffect(() => {
    setIsActive(false);
    setCurrentPhase("inhale");
    setCurrentCycle(1);
    setSecondsLeft(currentPattern.inhale);
    setAudioError(false);
    setProgress(0);
    
    updateCurrentAudioUrl();
  }, [currentPattern]);
  
  const updateCurrentAudioUrl = () => {
    let url = "";
    
    if (activeVoice === "vera") {
      if (currentPattern.veraUrl) {
        url = currentPattern.veraUrl;
      } else {
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
      }
    } else if (activeVoice === "marco") {
      if (currentPattern.marcoUrl) {
        url = currentPattern.marcoUrl;
      } else {
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
      }
    } else {
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

  useEffect(() => {
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
            setSecondsLeft(currentPattern.hold1 || 1);
            setProgress(0);
          } else if (currentPhase === "hold1") {
            setCurrentPhase("exhale");
            setSecondsLeft(currentPattern.exhale);
            setProgress(0);
          } else if (currentPhase === "exhale") {
            if (currentPattern.hold2) {
              setCurrentPhase("hold2");
              setSecondsLeft(currentPattern.hold2);
              setProgress(0);
            } else {
              if (currentCycle < currentPattern.cycles) {
                setCurrentCycle(cycle => cycle + 1);
                setCurrentPhase("inhale");
                setSecondsLeft(currentPattern.inhale);
                setProgress(0);
              } else {
                setIsActive(false);
                setCurrentCycle(1);
                setCurrentPhase("inhale");
                setSecondsLeft(currentPattern.inhale);
                setProgress(0);
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
              setProgress(0);
            } else {
              setIsActive(false);
              setCurrentCycle(1);
              setCurrentPhase("inhale");
              setSecondsLeft(currentPattern.inhale);
              setProgress(0);
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
              toast.success("Ademhalingsoefening voltooid!");
            }
          }
        }
      }, 1000);

      const getCurrentPhaseDuration = () => {
        switch (currentPhase) {
          case "inhale": return currentPattern.inhale;
          case "hold1": return currentPattern.hold1;
          case "exhale": return currentPattern.exhale;
          case "hold2": return currentPattern.hold2;
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
  }, [isActive, currentPhase, secondsLeft, currentCycle, currentPattern]);

  useEffect(() => {
    if (!isActive && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isActive]);

  const getPhaseForVisualization = () => {
    switch (currentPhase) {
      case "inhale": return "inhale";
      case "hold1":
      case "hold2": return "hold";
      case "exhale": return "exhale";
      default: return "rest";
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
      
      const veraUrl = currentPattern.veraUrl || currentPattern.vera_url;
      
      if (veraUrl) {
        setCurrentAudioUrl(veraUrl);
      } else {
        updateCurrentAudioUrl();
      }
      
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
      
      const marcoUrl = currentPattern.marcoUrl || currentPattern.marco_url;
      
      if (marcoUrl) {
        setCurrentAudioUrl(marcoUrl);
      } else {
        updateCurrentAudioUrl();
      }
      
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

          {currentPattern.description && !isActive && (
            <div className="mb-6 text-center">
              <p className="text-white/80 text-sm">{currentPattern.description}</p>
            </div>
          )}
          
          <div className="flex justify-center mb-6">
            <BreathingVisualization 
              phase={getPhaseForVisualization()}
              progress={progress}
              secondsLeft={secondsLeft}
              isActive={isActive}
              cycles={{
                current: currentCycle,
                total: currentPattern.cycles
              }}
              className="h-[280px]"
            />
          </div>
          
          <div className="text-center mb-2">
            {currentAudioUrl && !audioError && isActive ? (
              <p className="text-blue-200 text-xs">Audio speelt af</p>
            ) : null}
          </div>

          <div className="w-full max-w-md mx-auto mt-4">
            <Progress 
              value={progress} 
              max={100} 
              className="h-1.5 bg-white/10" 
              indicatorClassName={
                currentPhase === "inhale" 
                  ? "bg-gradient-to-r from-cyan-400 to-blue-400" 
                  : currentPhase === "hold1" || currentPhase === "hold2"
                    ? "bg-gradient-to-r from-violet-400 to-fuchsia-400" 
                    : "bg-gradient-to-r from-indigo-400 to-blue-400"
              }
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs mx-auto mt-6">
            <Button 
              onClick={startWithVera} 
              variant={isActive && activeVoice === "vera" ? "secondary" : "default"}
              size="lg"
              className={isActive && activeVoice === "vera" 
                ? "bg-blue-700 hover:bg-blue-800" 
                : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border-none"
              }
            >
              {isActive && activeVoice === "vera" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              Vera
            </Button>
            
            <Button 
              onClick={startWithMarco} 
              variant={isActive && activeVoice === "marco" ? "secondary" : "default"}
              size="lg"
              className={isActive && activeVoice === "marco" 
                ? "bg-blue-700 hover:bg-blue-800" 
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-none"
              }
            >
              {isActive && activeVoice === "marco" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              Marco
            </Button>
          </div>
          
          {isActive && (
            <p className="text-center text-sm text-white/70 mt-2 animate-pulse">
              {activeVoice === "vera" ? "Vera begeleidt je ademhaling..." : "Marco begeleidt je ademhaling..."}
            </p>
          )}
          
          <div className="flex justify-center mt-4">
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
