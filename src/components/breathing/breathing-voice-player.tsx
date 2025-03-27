
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { validateAudioUrl, preloadAudio } from "@/components/audio-player/utils";

interface VoiceUrls {
  inhale: string;
  hold: string;
  exhale: string;
}

interface BreathingVoicePlayerProps {
  veraUrls: VoiceUrls;
  marcoUrls: VoiceUrls;
  isActive: boolean;
  onPause: () => void;
  onPlay: (voice: "vera" | "marco") => void;
  activeVoice: "vera" | "marco" | null;
  onReset?: () => void;
  currentPhase?: string;
  currentCycle?: number;
  totalCycles?: number;
}

export const BreathingVoicePlayer: React.FC<BreathingVoicePlayerProps> = ({
  veraUrls,
  marcoUrls,
  isActive,
  onPause,
  onPlay,
  activeVoice,
  onReset,
  currentPhase,
  currentCycle,
  totalCycles
}) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const veraAudioRef = useRef<HTMLAudioElement | null>(null);
  const marcoAudioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate progress based on current cycle
  useEffect(() => {
    if (currentCycle && totalCycles && totalCycles > 0) {
      setProgressPercentage((currentCycle / totalCycles) * 100);
    } else {
      setProgressPercentage(0);
    }
  }, [currentCycle, totalCycles]);

  // Preload all audio files when the component mounts
  useEffect(() => {
    // Preload Vera audio
    if (validateUrls(veraUrls)) {
      preloadAudio(veraUrls.inhale);
      preloadAudio(veraUrls.hold);
      preloadAudio(veraUrls.exhale);
      console.log("Preloaded Vera audio URLs:", veraUrls);
    }
    
    // Preload Marco audio
    if (validateUrls(marcoUrls)) {
      preloadAudio(marcoUrls.inhale);
      preloadAudio(marcoUrls.hold);
      preloadAudio(marcoUrls.exhale);
      console.log("Preloaded Marco audio URLs:", marcoUrls);
    }
  }, [veraUrls, marcoUrls]);

  const validateUrls = (urls: VoiceUrls): boolean => {
    // Validate that the voice URLs are available
    return !!urls.inhale && !!urls.hold && !!urls.exhale;
  };
  
  // Test audio playback directly
  const testAudioPlayback = async (url: string, voiceName: string) => {
    if (!url) {
      console.error(`Empty ${voiceName} audio URL`);
      return false;
    }
    
    const validatedUrl = validateAudioUrl(url);
    console.log(`Testing ${voiceName} audio URL:`, validatedUrl);
    
    try {
      const audio = new Audio();
      audio.src = validatedUrl;
      audio.preload = 'auto';
      
      // Create a promise that resolves when the audio can play or rejects on error
      const canPlay = new Promise<boolean>((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => resolve(true), { once: true });
        audio.addEventListener('error', (e) => {
          console.error(`Error loading ${voiceName} audio:`, e);
          reject(new Error(`Cannot play ${voiceName} audio`));
        }, { once: true });
      });
      
      // Try to load the audio
      audio.load();
      
      // Wait for the audio to be ready or error
      await canPlay;
      return true;
    } catch (error) {
      console.error(`Failed to load ${voiceName} audio:`, error);
      return false;
    }
  };

  const handleVeraClick = async () => {
    // Validate URLs before activating
    if (!validateUrls(veraUrls)) {
      toast.error("Vera audio URLs zijn niet geconfigureerd");
      setHasError(true);
      return;
    }
    
    if (isActive && activeVoice === "vera") {
      onPause();
    } else {
      // Test "inhale" audio to ensure it works
      const canPlay = await testAudioPlayback(veraUrls.inhale, "Vera inhale");
      
      if (!canPlay) {
        toast.error("Kan Vera audio niet afspelen. Controleer de URLs.");
        setHasError(true);
        return;
      }
      
      setHasError(false);
      onPlay("vera");
      toast.success("Vera stem geactiveerd");
      console.log("Vera audio activated with URLs:", veraUrls);
    }
  };

  const handleMarcoClick = async () => {
    // Validate URLs before activating
    if (!validateUrls(marcoUrls)) {
      toast.error("Marco audio URLs zijn niet geconfigureerd");
      setHasError(true);
      return;
    }
    
    if (isActive && activeVoice === "marco") {
      onPause();
    } else {
      // Test "inhale" audio to ensure it works
      const canPlay = await testAudioPlayback(marcoUrls.inhale, "Marco inhale");
      
      if (!canPlay) {
        toast.error("Kan Marco audio niet afspelen. Controleer de URLs.");
        setHasError(true);
        return;
      }
      
      setHasError(false);
      onPlay("marco");
      toast.success("Marco stem geactiveerd");
      console.log("Marco audio activated with URLs:", marcoUrls);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xs mx-auto mt-2">
      {/* Status indicator for active phase and cycle */}
      {isActive && currentPhase && (
        <div className="mb-3 text-center">
          <div className="text-sm text-blue-200 font-medium">{currentPhase}</div>
          {currentCycle && totalCycles && (
            <div className="text-xs text-blue-100">
              Cyclus {currentCycle} van {totalCycles}
            </div>
          )}
        </div>
      )}
      
      {/* Progress indicator */}
      {isActive && currentCycle && totalCycles && (
        <div className="w-full mb-3">
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-blue-900/30"
            indicatorColor="bg-blue-400"
          />
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3 w-full">
        {/* Hidden audio elements for preloading */}
        <audio ref={veraAudioRef} preload="auto" style={{ display: 'none' }} />
        <audio ref={marcoAudioRef} preload="auto" style={{ display: 'none' }} />
        
        <Button 
          onClick={handleVeraClick} 
          variant={isActive && activeVoice === "vera" ? "secondary" : "default"}
          size="lg"
          className="w-full bg-blue-500 hover:bg-blue-600 border-none"
        >
          {isActive && activeVoice === "vera" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          Vera
        </Button>
        
        <Button 
          onClick={handleMarcoClick} 
          variant={isActive && activeVoice === "marco" ? "secondary" : "default"}
          size="lg"
          className="w-full bg-blue-500 hover:bg-blue-600 border-none"
        >
          {isActive && activeVoice === "marco" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          Marco
        </Button>
        
        {hasError && (
          <div className="col-span-2 text-red-500 text-xs text-center mt-1">
            Fout bij het afspelen van audio. Controleer de URL.
          </div>
        )}
        
        {onReset && (
          <Button 
            onClick={onReset}
            variant="outline" 
            size="sm"
            className="col-span-2 mt-3 bg-transparent border-blue-400/30 hover:bg-blue-900/20"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Reset
          </Button>
        )}
      </div>
    </div>
  );
};
