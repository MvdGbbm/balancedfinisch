
import React, { useState, useEffect, useRef } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { BreathExercise } from "@/components/breathing/breath-exercise";
import { BreathingMusicPlayer } from "@/components/breathing/breathing-music-player";
import BreathingAnimation, { BreathingTechnique } from "@/components/breathing/breathing-animation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BreathingCircle } from "@/components/breathing-circle";
import { toast } from "sonner";

const Breathing = () => {
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique>('4-7-8');
  
  // Breathing counter state
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("rest");
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cycles, setCycles] = useState({ current: 1, total: 5 });
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeVoice, setActiveVoice] = useState<"vera" | "marco" | null>(null);
  
  // Load technique parameters based on selected technique
  useEffect(() => {
    if (selectedTechnique === '4-7-8') {
      setSecondsLeft(4);
      setCycles({ current: 1, total: 5 });
    } else if (selectedTechnique === 'box-breathing') {
      setSecondsLeft(4);
      setCycles({ current: 1, total: 4 });
    } else if (selectedTechnique === 'diaphragmatic') {
      setSecondsLeft(4);
      setCycles({ current: 1, total: 6 });
    }
    
    // Reset state when technique changes
    setIsActive(false);
    setCurrentPhase("rest");
    setProgress(0);
    setActiveVoice(null);
  }, [selectedTechnique]);
  
  // Get technique parameters
  const getTechniqueParams = () => {
    switch (selectedTechnique) {
      case '4-7-8':
        return { inhale: 4, hold: 7, exhale: 8 };
      case 'box-breathing':
        return { inhale: 4, hold: 4, exhale: 4 };
      case 'diaphragmatic':
        return { inhale: 4, hold: 2, exhale: 6 };
      default:
        return { inhale: 4, hold: 4, exhale: 4 };
    }
  };
  
  // Handle voice selection and starting/stopping the breathing exercise
  const startWithVoice = (voice: "vera" | "marco") => {
    if (isActive && activeVoice === voice) {
      // Stop if already active with the same voice
      stopExercise();
    } else {
      // Start with the selected voice
      setActiveVoice(voice);
      setIsActive(true);
      setCurrentPhase("inhale");
      
      const params = getTechniqueParams();
      setSecondsLeft(params.inhale);
      
      // Play audio if available
      playPhaseAudio(voice, "inhale");
    }
  };
  
  // Play audio for the current phase
  const playPhaseAudio = (voice: "vera" | "marco", phase: "inhale" | "hold" | "exhale") => {
    if (!audioRef.current) return;
    
    // Get voice URLs from localStorage
    const voiceUrlsKey = voice === "vera" ? "veraVoiceUrls" : "marcoVoiceUrls";
    const savedUrls = localStorage.getItem(voiceUrlsKey);
    
    if (savedUrls) {
      try {
        const urls = JSON.parse(savedUrls);
        const audioUrl = phase === "hold" ? urls.hold : urls[phase];
        
        if (audioUrl) {
          audioRef.current.src = audioUrl;
          audioRef.current.play().catch(error => {
            console.error(`Error playing ${voice} ${phase} audio:`, error);
          });
        }
      } catch (error) {
        console.error(`Error parsing ${voice} URLs:`, error);
      }
    }
  };
  
  // Stop the exercise
  const stopExercise = () => {
    setIsActive(false);
    setActiveVoice(null);
    setCurrentPhase("rest");
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
  
  // Reset the exercise
  const resetExercise = () => {
    stopExercise();
    const params = getTechniqueParams();
    setSecondsLeft(params.inhale);
    setCycles({ ...cycles, current: 1 });
  };
  
  // Progress timer effect
  useEffect(() => {
    if (!isActive) return;
    
    const params = getTechniqueParams();
    let currentPhaseDuration = 0;
    
    switch (currentPhase) {
      case "inhale": currentPhaseDuration = params.inhale * 1000; break;
      case "hold": currentPhaseDuration = params.hold * 1000; break;
      case "exhale": currentPhaseDuration = params.exhale * 1000; break;
      default: return;
    }
    
    const startTime = Date.now();
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min((elapsed / currentPhaseDuration) * 100, 100);
      setProgress(calculatedProgress);
    }, 16);
    
    return () => clearInterval(progressTimer);
  }, [isActive, currentPhase, selectedTechnique]);
  
  // Main timer effect
  useEffect(() => {
    if (!isActive) return;
    
    const params = getTechniqueParams();
    let timer: number;
    
    timer = window.setTimeout(() => {
      if (secondsLeft > 1) {
        setSecondsLeft(secondsLeft - 1);
      } else {
        // Move to next phase
        if (currentPhase === "inhale") {
          setCurrentPhase("hold");
          setSecondsLeft(params.hold);
          setProgress(0);
          playPhaseAudio(activeVoice!, "hold");
        } else if (currentPhase === "hold") {
          setCurrentPhase("exhale");
          setSecondsLeft(params.exhale);
          setProgress(0);
          playPhaseAudio(activeVoice!, "exhale");
        } else if (currentPhase === "exhale") {
          // Check if we need to start a new cycle or finish
          if (cycles.current < cycles.total) {
            setCycles({ ...cycles, current: cycles.current + 1 });
            setCurrentPhase("inhale");
            setSecondsLeft(params.inhale);
            setProgress(0);
            playPhaseAudio(activeVoice!, "inhale");
          } else {
            // Exercise complete
            stopExercise();
            toast.success("Ademhalingsoefening voltooid!");
          }
        }
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isActive, secondsLeft, currentPhase, cycles, selectedTechnique, activeVoice]);

  return (
    <MobileLayout>
      <div className="space-y-6 animate-fade-in min-h-full p-4 rounded-lg bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/10 backdrop-blur-sm">
        <Tabs defaultValue="animation" className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="animation">Begeleide ademhaling</TabsTrigger>
            <TabsTrigger value="exercise">Ademhalingsoefeningen</TabsTrigger>
          </TabsList>
          
          <TabsContent value="animation">
            <div className="space-y-4">
              <div className="flex justify-center mb-2">
                <div className="inline-flex rounded-md shadow-sm">
                  <button 
                    onClick={() => setSelectedTechnique('4-7-8')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                      selectedTechnique === '4-7-8' 
                        ? 'bg-primary text-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    4-7-8
                  </button>
                  <button 
                    onClick={() => setSelectedTechnique('box-breathing')}
                    className={`px-4 py-2 text-sm font-medium ${
                      selectedTechnique === 'box-breathing' 
                        ? 'bg-primary text-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    Box Breathing
                  </button>
                  <button 
                    onClick={() => setSelectedTechnique('diaphragmatic')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                      selectedTechnique === 'diaphragmatic' 
                        ? 'bg-primary text-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    Diafragma
                  </button>
                </div>
              </div>
              
              <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 shadow-sm">
                {/* Hidden audio element for playback */}
                <audio ref={audioRef} />
                
                {/* Breathing circle visualization */}
                <div className="flex flex-col items-center justify-center">
                  <BreathingCircle 
                    isActive={isActive}
                    currentPhase={currentPhase}
                    secondsLeft={secondsLeft}
                  />
                  
                  {/* Cycle counter */}
                  {isActive && (
                    <div className="mt-2 text-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Cyclus {cycles.current} van {cycles.total}
                      </span>
                    </div>
                  )}
                  
                  {/* Progress bar */}
                  <div className="w-full max-w-xs mt-4">
                    <Progress 
                      value={progress} 
                      className="h-1.5" 
                      indicatorClassName={
                        currentPhase === "inhale" 
                          ? "bg-cyan-500" 
                          : currentPhase === "hold"
                            ? "bg-violet-500" 
                            : "bg-indigo-500"
                      }
                    />
                  </div>
                  
                  {/* Control buttons */}
                  <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-6">
                    <Button 
                      onClick={() => startWithVoice("vera")} 
                      variant={isActive && activeVoice === "vera" ? "secondary" : "default"}
                      className={isActive && activeVoice === "vera" 
                        ? "bg-blue-700 hover:bg-blue-800 text-white" 
                        : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                      }
                    >
                      {isActive && activeVoice === "vera" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                      Vera
                    </Button>
                    
                    <Button 
                      onClick={() => startWithVoice("marco")} 
                      variant={isActive && activeVoice === "marco" ? "secondary" : "default"}
                      className={isActive && activeVoice === "marco" 
                        ? "bg-blue-700 hover:bg-blue-800 text-white" 
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                      }
                    >
                      {isActive && activeVoice === "marco" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                      Marco
                    </Button>
                  </div>
                  
                  {isActive && (
                    <p className="text-center text-sm text-muted-foreground animate-pulse mt-2">
                      {activeVoice === "vera" ? "Vera begeleidt je ademhaling..." : "Marco begeleidt je ademhaling..."}
                    </p>
                  )}
                  
                  {/* Reset button */}
                  <Button 
                    onClick={resetExercise} 
                    variant="outline"
                    size="sm"
                    className="mt-4 text-muted-foreground"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="exercise">
            <BreathExercise />
          </TabsContent>
        </Tabs>
        
        <BreathingMusicPlayer />
      </div>
    </MobileLayout>
  );
};

export default Breathing;
