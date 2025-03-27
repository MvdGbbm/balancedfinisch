
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface BreathingVoicePlayerProps {
  veraUrl: string;
  marcoUrl: string;
  isActive: boolean;
  onPause: () => void;
  onPlay: (voice: "vera" | "marco") => void;
  activeVoice: "vera" | "marco" | null;
}

export const BreathingVoicePlayer: React.FC<BreathingVoicePlayerProps> = ({
  veraUrl,
  marcoUrl,
  isActive,
  onPause,
  onPlay,
  activeVoice
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (audioRef.current) {
      if (isActive) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error("Error playing audio:", e);
            setHasError(true);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isActive]);

  const handleVeraClick = () => {
    if (isActive && activeVoice === "vera") {
      onPause();
    } else {
      onPlay("vera");
    }
  };

  const handleMarcoClick = () => {
    if (isActive && activeVoice === "marco") {
      onPause();
    } else {
      onPlay("marco");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-xs mx-auto mt-6">
      <audio
        ref={audioRef}
        src={activeVoice === "vera" ? veraUrl : activeVoice === "marco" ? marcoUrl : ""}
        onError={() => setHasError(true)}
      />
      
      <Button 
        onClick={handleVeraClick} 
        variant={isActive && activeVoice === "vera" ? "secondary" : "default"}
        size="lg"
        className="w-full bg-blue-500 hover:bg-blue-600 border-none"
        disabled={!veraUrl}
      >
        {isActive && activeVoice === "vera" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
        Vera
      </Button>
      
      <Button 
        onClick={handleMarcoClick} 
        variant={isActive && activeVoice === "marco" ? "secondary" : "default"}
        size="lg"
        className="w-full bg-blue-500 hover:bg-blue-600 border-none"
        disabled={!marcoUrl}
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
