
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { BreathingPattern } from "@/lib/types/breathing";

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

  // Reset state when pattern changes
  useEffect(() => {
    setIsActive(false);
    setCurrentPhase("inhale");
    setCurrentCycle(1);
    setAudioError(false);
    setProgress(0);
    if (pattern) {
      setSecondsLeft(pattern.inhale);
      setCurrentAudioUrl(pattern.inhale_url || "");
    }
  }, [pattern]);

  // A separate effect to handle audio loading on phase change
  useEffect(() => {
    if (!pattern || !audioRef.current) return;

    // Get the correct URL for the current phase
    let url = "";
    switch (currentPhase) {
      case "inhale":
        url = pattern.inhale_url || "";
        break;
      case "hold1":
        url = pattern.hold1_url || "";
        break;
      case "exhale":
        url = pattern.exhale_url || "";
        break;
      case "hold2":
        url = pattern.hold2_url || "";
        break;
    }

    // Set the new URL
    setCurrentAudioUrl(url);
    setAudioError(false);

    // Only load and play if there's a URL and the exercise is active
    if (url && isActive) {
      // Stop any currently playing audio before starting a new one
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Set the src attribute directly 
      audioRef.current.src = url;
      audioRef.current.load();

      // Reset audio and play with a small delay to prevent interruptions
      const playAudio = () => {
        if (audioRef.current && isActive) {
          audioRef.current.play().catch(error => {
            console.error("Error playing audio:", error);
            setAudioError(true);
            toast.error("Kan audio niet afspelen. Controleer de URL.");
          });
        }
      };

      // Add a small delay to prevent interruptions
      setTimeout(playAudio, 100);
    }
  }, [currentPhase, isActive, pattern]);

  // Stop audio when exercise is paused
  useEffect(() => {
    if (!isActive && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isActive]);

  // Handle phase transition timer
  useEffect(() => {
    if (!pattern) return;
    let timer: number | null = null;
    let progressTimer: number | null = null;
    if (isActive) {
      // Set up the phase timer
      timer = window.setInterval(() => {
        if (secondsLeft > 1) {
          setSecondsLeft(seconds => seconds - 1);
        } else {
          // Stop current audio if any
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }

          // Move to next phase
          if (currentPhase === "inhale") {
            setCurrentPhase("hold1");
            setSecondsLeft(pattern.hold1 || 1);
            setProgress(0); // Reset progress for new phase
          } else if (currentPhase === "hold1") {
            setCurrentPhase("exhale");
            setSecondsLeft(pattern.exhale);
            setProgress(0); // Reset progress for new phase
          } else if (currentPhase === "exhale") {
            if (pattern.hold2) {
              setCurrentPhase("hold2");
              setSecondsLeft(pattern.hold2);
              setProgress(0); // Reset progress for new phase
            } else {
              // If no hold2, go to next cycle or finish
              if (currentCycle < pattern.cycles) {
                setCurrentCycle(cycle => cycle + 1);
                setCurrentPhase("inhale");
                setSecondsLeft(pattern.inhale);
                setProgress(0); // Reset progress for new phase
              } else {
                // Exercise complete
                setIsActive(false);
                setCurrentCycle(1);
                setCurrentPhase("inhale");
                setSecondsLeft(pattern.inhale);
                setProgress(0);
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                }
                toast.success("Test voltooid!");
              }
            }
          } else if (currentPhase === "hold2") {
            // Cycle completed, start next or finish
            if (currentCycle < pattern.cycles) {
              setCurrentCycle(cycle => cycle + 1);
              setCurrentPhase("inhale");
              setSecondsLeft(pattern.inhale);
              setProgress(0); // Reset progress for new phase
            } else {
              // Exercise complete
              setIsActive(false);
              setCurrentCycle(1);
              setCurrentPhase("inhale");
              setSecondsLeft(pattern.inhale);
              setProgress(0);
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
              toast.success("Test voltooid!");
            }
          }
        }
      }, 1000);

      // Set up the progress timer for smoother animation
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
      }, 16); // ~60fps
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

    // Reset audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Set initial audio URL for the inhale phase
    setCurrentAudioUrl(pattern.inhale_url || "");
  };
  
  const toggleExercise = () => {
    setIsActive(!isActive);

    // If starting the exercise, try to play audio if available
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
        {/* Audio element with explicit controls */}
        <audio ref={audioRef} src={currentAudioUrl} preload="auto" onError={() => setAudioError(true)} />
        
        <div className="flex flex-col items-center justify-center space-y-6 py-4">
          {/* Visual representation of breathing phase with simple animated circle */}
          
          
          <div className="relative h-40 w-40 flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full transition-all duration-500 ease-in-out
              ${currentPhase === "inhale" ? "bg-gradient-to-r from-blue-600 to-cyan-500" : currentPhase === "hold1" ? "bg-gradient-to-r from-purple-500 to-amber-400" : currentPhase === "exhale" ? "bg-gradient-to-r from-indigo-600 to-blue-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"}`} />
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
          
          <div className="flex gap-3">
            <Button onClick={toggleExercise} variant="default" size="lg">
              {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isActive ? "Pauze" : "Start"}
            </Button>
            
            <Button onClick={resetExercise} variant="outline" size="lg">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>;
}
