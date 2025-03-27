
import React, { useState, useEffect, useRef } from "react";
import { validateAudioUrl } from "@/components/audio-player/utils";

interface VoiceUrls {
  inhale: string;
  hold: string;
  exhale: string;
}

export interface BreathingAnimationProps {
  technique: "4-7-8" | "box-breathing" | "diaphragmatic";
  voiceUrls: VoiceUrls;
  isVoiceActive: boolean;
  onPhaseChange?: (phase: string) => void;
  onCycleChange?: (cycle: number) => void;
  currentPhase?: string;
}

const BreathingAnimation: React.FC<BreathingAnimationProps> = ({
  technique,
  voiceUrls,
  isVoiceActive,
  onPhaseChange,
  onCycleChange,
  currentPhase
}) => {
  const [circleScale, setCircleScale] = useState<number>(1);
  const [phase, setPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale");
  const [secondsLeft, setSecondsLeft] = useState<number>(4);
  const [cycle, setCycle] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  
  // Get timing config based on the selected technique
  const getTiming = () => {
    switch (technique) {
      case "4-7-8":
        return { inhale: 4, hold1: 7, exhale: 8, hold2: 0, cycles: 5 };
      case "box-breathing":
        return { inhale: 4, hold1: 4, exhale: 4, hold2: 4, cycles: 4 };
      case "diaphragmatic":
        return { inhale: 4, hold1: 0, exhale: 6, hold2: 0, cycles: 6 };
      default:
        return { inhale: 4, hold1: 4, exhale: 4, hold2: 0, cycles: 4 };
    }
  };
  
  const timingConfig = getTiming();
  
  // Reset animation when technique changes
  useEffect(() => {
    const timing = getTiming();
    setPhase("inhale");
    setSecondsLeft(timing.inhale);
    setCycle(1);
    setCircleScale(1);
  }, [technique]);
  
  // Update circle scale based on phase
  useEffect(() => {
    if (!isVoiceActive) {
      setCircleScale(1);
      return;
    }
    
    switch (phase) {
      case "inhale":
        // Gradually expand during inhale
        setCircleScale(1 + ((timingConfig.inhale - secondsLeft) / timingConfig.inhale) * 0.5);
        break;
      case "hold1":
        // Stay expanded during hold
        setCircleScale(1.5);
        break;
      case "exhale":
        // Gradually contract during exhale
        setCircleScale(1.5 - ((timingConfig.exhale - secondsLeft) / timingConfig.exhale) * 0.5);
        break;
      case "hold2":
        // Stay contracted during second hold
        setCircleScale(1);
        break;
      default:
        setCircleScale(1);
    }
  }, [phase, secondsLeft, isVoiceActive, technique, timingConfig]);
  
  // Reset animation when active status changes
  useEffect(() => {
    if (!isVoiceActive) {
      const timing = getTiming();
      setPhase("inhale");
      setSecondsLeft(timing.inhale);
      setCycle(1);
      setCircleScale(1);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isVoiceActive]);
  
  // Update audio URL based on the current phase
  useEffect(() => {
    if (!isVoiceActive || !voiceUrls) return;
    
    let url = "";
    switch (phase) {
      case "inhale":
        url = voiceUrls.inhale;
        if (onPhaseChange) onPhaseChange("Adem in");
        break;
      case "hold1":
        url = voiceUrls.hold;
        if (onPhaseChange) onPhaseChange("Vasthouden");
        break;
      case "exhale":
        url = voiceUrls.exhale;
        if (onPhaseChange) onPhaseChange("Adem uit");
        break;
      case "hold2":
        url = voiceUrls.hold;
        if (onPhaseChange) onPhaseChange("Vasthouden");
        break;
    }
    
    if (url) {
      const validatedUrl = validateAudioUrl(url);
      setAudioUrl(validatedUrl);
      
      // Play the audio immediately on phase change
      if (audioRef.current) {
        audioRef.current.src = validatedUrl;
        audioRef.current.load();
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
        });
      }
    }
  }, [phase, voiceUrls, isVoiceActive]);
  
  // Notify parent of cycle changes
  useEffect(() => {
    if (onCycleChange) {
      onCycleChange(cycle);
    }
  }, [cycle, onCycleChange]);
  
  // Handle breathing timer
  useEffect(() => {
    if (!isVoiceActive) return;
    
    const timer = setInterval(() => {
      if (secondsLeft > 1) {
        setSecondsLeft(prev => prev - 1);
      } else {
        // Phase is complete, move to next phase
        const timing = getTiming();
        
        if (phase === "inhale") {
          if (timing.hold1 > 0) {
            setPhase("hold1");
            setSecondsLeft(timing.hold1);
          } else {
            setPhase("exhale");
            setSecondsLeft(timing.exhale);
          }
        } else if (phase === "hold1") {
          setPhase("exhale");
          setSecondsLeft(timing.exhale);
        } else if (phase === "exhale") {
          if (timing.hold2 > 0) {
            setPhase("hold2");
            setSecondsLeft(timing.hold2);
          } else {
            // Move to next cycle or finish
            if (cycle < timing.cycles) {
              setCycle(prev => prev + 1);
              setPhase("inhale");
              setSecondsLeft(timing.inhale);
            } else {
              // Exercise complete
              if (onPhaseChange) onPhaseChange("Voltooid");
              // Reset for next time
              setCycle(1);
              setPhase("inhale");
              setSecondsLeft(timing.inhale);
            }
          }
        } else if (phase === "hold2") {
          // Move to next cycle or finish
          if (cycle < timing.cycles) {
            setCycle(prev => prev + 1);
            setPhase("inhale");
            setSecondsLeft(timing.inhale);
          } else {
            // Exercise complete
            if (onPhaseChange) onPhaseChange("Voltooid");
            // Reset for next time
            setCycle(1);
            setPhase("inhale");
            setSecondsLeft(timing.inhale);
          }
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isVoiceActive, phase, secondsLeft, cycle, technique, onPhaseChange]);
  
  // Render animation circle with color based on phase
  const getCircleColor = () => {
    switch (phase) {
      case "inhale":
        return "from-blue-600 to-cyan-500";
      case "hold1":
        return "from-purple-500 to-amber-400";  
      case "exhale":
        return "from-indigo-600 to-blue-500";
      case "hold2":
        return "from-teal-500 to-blue-500";
      default:
        return "from-blue-600 to-cyan-500";
    }
  };
  
  return (
    <div className="relative h-[250px] w-[250px] mx-auto mb-6 flex items-center justify-center">
      {/* Background circles for depth */}
      <div className="absolute inset-0 rounded-full bg-blue-600/10 transform scale-110"></div>
      <div className="absolute inset-0 rounded-full bg-blue-600/5 transform scale-125"></div>
      
      {/* Animated breathing circle */}
      <div 
        className={`absolute inset-0 rounded-full bg-gradient-to-r ${getCircleColor()} shadow-lg`}
        style={{
          transform: `scale(${circleScale})`,
          transition: 'transform 1s ease-in-out, background-color 1s ease-in-out'
        }}
      ></div>
      
      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
        <p className="text-4xl font-bold">{secondsLeft}</p>
        <p className="text-lg font-medium mt-1">{currentPhase || 
          (phase === "inhale" ? "Adem in" : 
           phase === "hold1" ? "Vasthouden" : 
           phase === "exhale" ? "Adem uit" : 
           "Vasthouden")
        }</p>
        <p className="text-sm mt-2">Cyclus {cycle}/{timingConfig.cycles}</p>
      </div>
      
      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioUrl} preload="auto" style={{ display: 'none' }} />
    </div>
  );
};

export default BreathingAnimation;
