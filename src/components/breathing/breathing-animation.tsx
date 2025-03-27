
import React, { useState, useEffect, useRef } from "react";
import { validateAudioUrl, processVoiceAudioUrl } from "@/components/audio-player/utils";

interface BreathingAnimationProps {
  technique: "4-7-8" | "box-breathing" | "diaphragmatic";
  voiceUrls: {
    inhale: string;
    hold: string;
    exhale: string;
  };
  isVoiceActive: boolean;
}

const BreathingAnimation: React.FC<BreathingAnimationProps> = ({
  technique,
  voiceUrls,
  isVoiceActive
}) => {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [count, setCount] = useState<number>(0);
  const [maxCount, setMaxCount] = useState<number>(4);
  const [circleSize, setCircleSize] = useState<number>(120);
  const circleRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  
  // Configure breathing pattern based on technique
  useEffect(() => {
    if (technique === "4-7-8") {
      setMaxCount({
        inhale: 4,
        hold: 7,
        exhale: 8,
        rest: 0
      }[phase]);
    } else if (technique === "box-breathing") {
      setMaxCount({
        inhale: 4,
        hold: 4,
        exhale: 4,
        rest: 4
      }[phase]);
    } else if (technique === "diaphragmatic") {
      setMaxCount({
        inhale: 4,
        hold: 2,
        exhale: 6,
        rest: 0
      }[phase]);
    }
  }, [technique, phase]);
  
  // Handle audio playback for current phase
  useEffect(() => {
    if (!isVoiceActive || !audioRef.current) return;
    
    // Select the appropriate audio URL for the current phase
    let audioUrl = "";
    
    if (phase === "inhale") {
      audioUrl = processVoiceAudioUrl(voiceUrls.inhale, "inhale");
    } else if (phase === "hold") {
      audioUrl = processVoiceAudioUrl(voiceUrls.hold, "hold");
    } else if (phase === "exhale") {
      audioUrl = processVoiceAudioUrl(voiceUrls.exhale, "exhale");
    }
    
    if (audioUrl) {
      console.log(`Playing audio for phase: ${phase} URL: ${audioUrl}`);
      
      // Set the audio source
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      
      // Play the audio
      try {
        const playPromise = audioRef.current.play();
        
        // Handle play promise for modern browsers
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`Initial play for current phase: ${phase} URL: ${audioUrl}`);
            })
            .catch(error => {
              console.error("Error playing audio:", error);
            });
        }
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    }
  }, [phase, voiceUrls, isVoiceActive]);
  
  // Main breathing animation logic
  useEffect(() => {
    if (!isVoiceActive) return;
    
    // Start with inhale phase
    setPhase("inhale");
    setCount(0);
    
    // Clear any existing timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    
    // Start the breathing cycle
    timerRef.current = window.setInterval(() => {
      setCount(prevCount => {
        const newCount = prevCount + 1;
        
        // If we've reached the maximum count for this phase, move to the next phase
        if (newCount >= maxCount) {
          // Move to the next phase
          if (phase === "inhale") {
            setPhase("hold");
            // Expand the circle for inhalation
            setCircleSize(180);
          } else if (phase === "hold") {
            setPhase("exhale");
          } else if (phase === "exhale") {
            // Shrink the circle for exhalation
            setCircleSize(120);
            if (technique === "box-breathing") {
              setPhase("rest");
            } else {
              setPhase("inhale");
            }
          } else if (phase === "rest") {
            setPhase("inhale");
          }
          
          return 0; // Reset count for the new phase
        }
        
        // Update the circle size based on the phase
        if (phase === "inhale") {
          // Gradually expand from 120 to 180
          const progress = newCount / maxCount;
          setCircleSize(120 + 60 * progress);
        } else if (phase === "exhale") {
          // Gradually shrink from 180 to 120
          const progress = newCount / maxCount;
          setCircleSize(180 - 60 * progress);
        }
        
        return newCount;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [isVoiceActive, maxCount, phase, technique]);
  
  // Update the circle animation when the technique changes
  useEffect(() => {
    setPhase("inhale");
    setCount(0);
    setCircleSize(120);
  }, [technique]);
  
  // Get instruction text for the current phase
  const getInstructionText = () => {
    switch (phase) {
      case "inhale":
        return "Adem in";
      case "hold":
        return "Houd vast";
      case "exhale":
        return "Adem uit";
      case "rest":
        return "Rust";
      default:
        return "";
    }
  };
  
  // Get the background color for the current phase
  const getPhaseColor = () => {
    switch (phase) {
      case "inhale":
        return "bg-blue-500";
      case "hold":
        return "bg-purple-500";
      case "exhale":
        return "bg-cyan-500";
      case "rest":
        return "bg-indigo-600";
      default:
        return "bg-blue-500";
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xs">
      <audio ref={audioRef} preload="auto" />
      
      <div className="relative mb-6">
        <div 
          ref={circleRef}
          className={`rounded-full transition-all duration-1000 ease-in-out ${getPhaseColor()} flex items-center justify-center shadow-lg`}
          style={{ 
            width: `${circleSize}px`, 
            height: `${circleSize}px`,
          }}
        >
          <div className="text-white text-center">
            <p className="text-3xl font-bold">{maxCount - count}</p>
            <p className="text-sm font-medium">{getInstructionText()}</p>
          </div>
        </div>
      </div>
      
      <div className="text-center mb-6">
        <p className="text-lg text-white font-medium">{getInstructionText()}</p>
        <p className="text-sm text-white/70">
          {technique === "4-7-8" ? "4-7-8 Techniek" : 
           technique === "box-breathing" ? "Box Breathing" : 
           "Diafragmatische Ademhaling"}
        </p>
      </div>
    </div>
  );
};

export default BreathingAnimation;
