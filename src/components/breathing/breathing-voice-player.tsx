
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
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
}

export const BreathingVoicePlayer: React.FC<BreathingVoicePlayerProps> = ({
  veraUrls,
  marcoUrls,
  isActive,
  onPause,
  onPlay,
  activeVoice
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

  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-xs mx-auto mt-6">
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
    </div>
  );
};
