
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";
import { toast } from "sonner";

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
  currentCycle?: number;
  totalCycles?: number;
  currentPhase?: string;
}

export const BreathingVoicePlayer: React.FC<BreathingVoicePlayerProps> = ({
  veraUrls,
  marcoUrls,
  isActive,
  onPause,
  onPlay,
  activeVoice,
  onReset,
  currentCycle = 1,
  totalCycles = 5,
  currentPhase = "Inademen"
}) => {
  const [hasError, setHasError] = useState<boolean>(false);

  const validateUrls = (urls: VoiceUrls): boolean => {
    // Validate that the voice URLs are available
    return !!urls.inhale && !!urls.hold && !!urls.exhale;
  };

  const handleVeraClick = () => {
    // Validate URLs before activating
    if (!validateUrls(veraUrls)) {
      toast.error("Vera audio URLs zijn niet geconfigureerd");
      setHasError(true);
      return;
    }
    
    if (isActive && activeVoice === "vera") {
      onPause();
    } else {
      setHasError(false);
      onPlay("vera");
      toast.success("Vera stem geactiveerd");
      console.log("Vera audio activated with URLs:", veraUrls);
    }
  };

  const handleMarcoClick = () => {
    // Validate URLs before activating
    if (!validateUrls(marcoUrls)) {
      toast.error("Marco audio URLs zijn niet geconfigureerd");
      setHasError(true);
      return;
    }
    
    if (isActive && activeVoice === "marco") {
      onPause();
    } else {
      setHasError(false);
      onPlay("marco");
      toast.success("Marco stem geactiveerd");
      console.log("Marco audio activated with URLs:", marcoUrls);
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      toast.info("Ademhalingsoefening gereset");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-md mx-auto">
      {/* Current phase display */}
      <h2 className="text-xl font-medium text-white">{currentPhase}</h2>
      
      {/* Audio status */}
      <p className="text-sm text-gray-300">
        {isActive ? "Audio speelt af" : ""}
      </p>
      
      {/* Cycle counter */}
      <p className="text-sm text-gray-400">
        Cyclus {currentCycle} van {totalCycles}
      </p>
      
      {/* Voice buttons container */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <Button 
          onClick={handleVeraClick}
          variant="outline"
          size="lg"
          className={`w-full border-2 rounded-full ${
            isActive && activeVoice === "vera" 
              ? "bg-transparent border-white text-white" 
              : "bg-white text-navy-950 border-white hover:bg-gray-100"
          }`}
        >
          {isActive && activeVoice === "vera" ? (
            <Pause className="mr-2 h-4 w-4" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Vera
        </Button>
        
        <Button 
          onClick={handleMarcoClick}
          variant="outline" 
          size="lg"
          className={`w-full border-2 rounded-full ${
            isActive && activeVoice === "marco" 
              ? "bg-transparent border-white text-white" 
              : "bg-white text-navy-950 border-white hover:bg-gray-100"
          }`}
        >
          {isActive && activeVoice === "marco" ? (
            <Pause className="mr-2 h-4 w-4" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Marco
        </Button>
      </div>
      
      {/* Reset button */}
      {onReset && (
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="mt-4 border border-gray-700 text-white hover:bg-navy-800"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      )}
      
      {hasError && (
        <div className="text-red-500 text-xs text-center mt-1">
          Fout bij het afspelen van audio. Controleer de URL.
        </div>
      )}
    </div>
  );
};
