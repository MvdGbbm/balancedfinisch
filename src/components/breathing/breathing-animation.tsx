
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Volume2, Play, Pause, VolumeX } from "lucide-react";
import { BreathingAudio } from "@/components/breathing/breathing-audio";
import { Slider } from "@/components/ui/slider";
import { BreathingCircle } from "@/components/breathing-circle";

interface BreathingAnimationProps {
  isActive: boolean;
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
  afterExhaleHoldTime: number;
  breathingText: string[];
  breathingMode: string;
  guideVoiceEnabled: boolean;
  onToggleGuideVoice: () => void;
}

export const BreathingAnimation: React.FC<BreathingAnimationProps> = ({
  isActive,
  inhaleTime,
  holdTime,
  exhaleTime,
  afterExhaleHoldTime,
  breathingText,
  breathingMode,
  guideVoiceEnabled,
  onToggleGuideVoice
}) => {
  const [circleDiameter, setCircleDiameter] = useState(50);
  const [volume, setVolume] = useState(0.5);
  const circleRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    let startTime: number | null = null;
    let animationId: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const cycleTime = inhaleTime + holdTime + exhaleTime + afterExhaleHoldTime;
      const timeInCycle = (timestamp - startTime) % (cycleTime * 1000);

      let diameter = 0;

      if (timeInCycle < inhaleTime * 1000) {
        // Inhale
        diameter = 50 + ((timeInCycle / (inhaleTime * 1000)) * 50);
      } else if (timeInCycle < (inhaleTime + holdTime) * 1000) {
        // Hold after inhale
        diameter = 100;
      } else if (timeInCycle < (inhaleTime + holdTime + exhaleTime) * 1000) {
        // Exhale
        const exhaleStartTime = (inhaleTime + holdTime) * 1000;
        diameter = 100 - (((timeInCycle - exhaleStartTime) / (exhaleTime * 1000)) * 50);
      } else {
        // Hold after exhale
        diameter = 50;
      }

      setCircleDiameter(diameter);
      animationId = requestAnimationFrame(animate);
    };

    if (isActive) {
      startTime = null;
      animationId = requestAnimationFrame(animate);
    } else if (animationId) {
      cancelAnimationFrame(animationId);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isActive, inhaleTime, holdTime, exhaleTime, afterExhaleHoldTime]);
  
  const handleVolumeChange = (newValue: number[]) => {
    const newVolume = newValue[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };
  
  const handleMuteToggle = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume === 0 ? 0.5 : volume;
        setVolume(volume === 0 ? 0.5 : volume);
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setVolume(0);
        setIsMuted(true);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        ref={circleRef}
        className="rounded-full border border-primary flex items-center justify-center transition-all duration-500"
        style={{
          width: `${circleDiameter * 2}px`,
          height: `${circleDiameter * 2}px`,
        }}
      >
        <p className="text-xl font-semibold text-primary">
          {breathingText[0]}
        </p>
      </div>
      
      <div className="mt-4 flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleMuteToggle}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        <Slider
          value={[volume]}
          min={0}
          max={1}
          step={0.02}
          onValueChange={handleVolumeChange}
          className="w-24"
        />
        <Button 
          variant={guideVoiceEnabled ? "default" : "outline"}
          onClick={onToggleGuideVoice}
        >
          {guideVoiceEnabled ? "Stem uit" : "Stem aan"}
        </Button>
      </div>
      
      <BreathingAudio 
        isActive={isActive}
        inhaleTime={inhaleTime}
        holdTime={holdTime}
        exhaleTime={exhaleTime}
        afterExhaleHoldTime={afterExhaleHoldTime}
        breathingMode={breathingMode}
        volume={volume}
        ref={audioRef}
      />
    </div>
  );
};

// Add default export in addition to named export
export default BreathingAnimation;
