import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Pause, Play, Timer } from "lucide-react";

interface BreathingCircleProps {
  duration?: number;
  inhaleDuration?: number;
  holdDuration?: number;
  exhaleDuration?: number;
  className?: string;
  onBreathComplete?: () => void;
}

export function BreathingCircle({
  inhaleDuration = 4000,
  holdDuration = 2000,
  exhaleDuration = 6000,
  className,
  onBreathComplete
}: BreathingCircleProps) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("rest");
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [textFade, setTextFade] = useState(1);

  useEffect(() => {
    if (isActive) {
    } else {
      setPhase("rest");
      setProgress(0);
    }
  }, [inhaleDuration, holdDuration, exhaleDuration, isActive]);

  useEffect(() => {
    if (!isActive) return;
    
    let startTime = Date.now();
    let currentPhase = phase;
    let phaseDuration = currentPhase === "inhale" ? inhaleDuration : currentPhase === "hold" ? holdDuration : exhaleDuration;
    
    const calculateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, phaseDuration - elapsed);
      const phaseProgress = elapsed / phaseDuration * 100;
      
      if (phaseProgress > 80 && textFade > 0) {
        const fadeOutProgress = (phaseProgress - 80) * 5;
        setTextFade(Math.max(0, 1 - fadeOutProgress / 100));
      }
      
      setPhaseTimeLeft(Math.ceil(remaining / 1000));
      setProgress(Math.min(phaseProgress, 100));
      setTransitionProgress(Math.min(phaseProgress / 100, 1));
      return elapsed >= phaseDuration;
    };

    calculateProgress();

    const interval = setInterval(() => {
      if (calculateProgress()) {
        if (currentPhase === "inhale") {
          currentPhase = "hold";
          phaseDuration = holdDuration;
        } else if (currentPhase === "hold") {
          currentPhase = "exhale";
          phaseDuration = exhaleDuration;
        } else {
          if (onBreathComplete) onBreathComplete();
          currentPhase = "inhale";
          phaseDuration = inhaleDuration;
        }
        
        setTextFade(0);
        setPhase(currentPhase);
        setTimeout(() => {
          setTextFade(1);
        }, 200);
        
        startTime = Date.now();
        setProgress(0);
        setTransitionProgress(0);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isActive, inhaleDuration, holdDuration, exhaleDuration, onBreathComplete, phase, textFade]);

  const toggleActive = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setPhase("inhale");
      setProgress(0);
      setPhaseTimeLeft(Math.ceil(inhaleDuration / 1000));
      setTextFade(1);
    } else {
      setPhase("rest");
    }
  };

  const getGradientStyle = () => {
    let style = {};
    
    if (phase === "rest") {
      return {
        background: "linear-gradient(to right, #2563eb, #3b82f6)"
      };
    }
    
    if (phase === "inhale") {
      return {
        background: `linear-gradient(to right, 
          #2563eb, 
          hsl(${230 + transitionProgress * 30}, ${60 + transitionProgress * 10}%, ${50 - transitionProgress * 5}%),
          hsl(${260 + transitionProgress * 20}, ${70 + transitionProgress * 10}%, ${50}%))`
      };
    }
    
    if (phase === "hold") {
      return {
        background: `linear-gradient(to right, 
          hsl(${280 - transitionProgress * 20}, ${70}%, ${50}%), 
          hsl(${260 - transitionProgress * 70}, ${80 - transitionProgress * 20}%, ${60 + transitionProgress * 20}%),
          hsl(${190 - transitionProgress * 50}, ${90 - transitionProgress * 10}%, ${70 + transitionProgress * 10}%))`
      };
    }
    
    if (phase === "exhale") {
      return {
        background: `linear-gradient(to right, 
          hsl(${45 - transitionProgress * 15}, ${80 - transitionProgress * 20}%, ${70 - transitionProgress * 10}%), 
          hsl(${30 + transitionProgress * 180}, ${70 + transitionProgress * 10}%, ${60 - transitionProgress * 10}%),
          hsl(${210 + transitionProgress * 30}, ${80}%, ${50}%))`
      };
    }
    
    return style;
  };

  const getPhaseText = () => {
    if (phase === "inhale") return "Adem in";
    if (phase === "hold") return "Houd vast";
    if (phase === "exhale") return "Adem uit";
    return "";
  };

  return <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative w-full max-w-xs">
        {phase !== "rest" && <Progress value={progress} className="h-2 mb-6 bg-gray-800" />}
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-gray-900 shadow-[0_0_40px_rgba(0,0,0,0.6)]" style={{
        width: '280px',
        height: '280px',
        transform: 'translate(-10px, -10px)'
      }} />
        
        <div className={cn("relative flex items-center justify-center rounded-full transition-all", {
        "scale-100 opacity-100": phase === "rest" || phase === "exhale",
        "scale-125 opacity-100": phase === "inhale" || phase === "hold"
      }, className)} style={{
        width: '260px',
        height: '260px',
        transition: `all ${phase === "inhale" ? inhaleDuration : phase === "exhale" ? exhaleDuration : holdDuration}ms ease-in-out`
      }}>
          <div className="rounded-full flex items-center justify-center transition-all shadow-[0_0_30px_rgba(0,100,255,0.4)]" 
               style={{
                  width: '100%',
                  height: '100%',
                  transition: 'background 500ms linear',
                  ...getGradientStyle()
               }}>
            <div className="text-center text-white">
              {phase === "rest" ? <button onClick={toggleActive} className="flex flex-col items-center justify-center space-y-2 px-6 py-4 rounded-full transition-colors">
                  <Play className="h-8 w-8" />
                  <span className="text-lg font-medium">Start</span>
                </button> : <div className="flex flex-col items-center space-y-2">
                  <div 
                    className="text-2xl font-semibold mb-1 transition-opacity duration-500" 
                    style={{ opacity: textFade }}
                  >
                    {getPhaseText()}
                  </div>
                  <div className="flex items-center justify-center text-4xl font-bold">
                    {phaseTimeLeft}
                    <span className="text-sm ml-1 mt-1">s</span>
                  </div>
                  <button onClick={toggleActive} className="mt-4 flex items-center justify-center space-x-1 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors">
                    <Pause className="h-4 w-4" />
                    <span>Pauzeren</span>
                  </button>
                </div>}
            </div>
          </div>
        </div>
      </div>
      
      {isActive && <div className="mt-4 text-center flex items-center gap-2 text-sm text-muted-foreground">
          <Timer className="h-4 w-4" />
          <p className="py-[25px]">
            Adem in ({inhaleDuration / 1000}s) → Houd vast ({holdDuration / 1000}s) →
            Adem uit ({exhaleDuration / 1000}s)
          </p>
        </div>}
    </div>;
}
