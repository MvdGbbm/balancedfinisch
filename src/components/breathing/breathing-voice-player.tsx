
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { validateAudioUrl } from "@/components/audio-player/utils";

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
}

export const BreathingVoicePlayer: React.FC<BreathingVoicePlayerProps> = ({
  veraUrls,
  marcoUrls,
  isActive,
  onPause,
  onPlay,
  activeVoice,
  onReset
}) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Preload audio files to check for errors
  useEffect(() => {
    const preloadAudio = async (url: string) => {
      try {
        if (!url) return;
        
        const validatedUrl = validateAudioUrl(url);
        if (!validatedUrl) return;
        
        const audio = new Audio();
        audio.src = validatedUrl;
        
        // Force preload (doesn't need to finish loading)
        audio.load();
      } catch (error) {
        console.error("Error preloading audio:", error);
      }
    };
    
    // Preload all audio files
    preloadAudio(veraUrls.inhale);
    preloadAudio(veraUrls.hold);
    preloadAudio(veraUrls.exhale);
    preloadAudio(marcoUrls.inhale);
    preloadAudio(marcoUrls.hold);
    preloadAudio(marcoUrls.exhale);
  }, [veraUrls, marcoUrls]);

  const validateUrls = (urls: VoiceUrls): boolean => {
    return Boolean(urls.inhale && urls.hold && urls.exhale);
  };

  const handleVeraClick = async () => {
    if (!validateUrls(veraUrls)) {
      setHasError(true);
      toast.error("Vera audio URL's ontbreken");
      return;
    }
    
    if (isActive && activeVoice === "vera") {
      onPause();
    } else {
      setLoading(true);
      try {
        onPlay("vera");
        toast.success("Vera stem geactiveerd");
        console.log("Vera audio activated");
        setHasError(false);
      } catch (error) {
        console.error("Error activating Vera audio:", error);
        setHasError(true);
        toast.error("Fout bij het activeren van Vera audio");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarcoClick = async () => {
    if (!validateUrls(marcoUrls)) {
      setHasError(true);
      toast.error("Marco audio URL's ontbreken");
      return;
    }
    
    if (isActive && activeVoice === "marco") {
      onPause();
    } else {
      setLoading(true);
      try {
        onPlay("marco");
        toast.success("Marco stem geactiveerd");
        console.log("Marco audio activated");
        setHasError(false);
      } catch (error) {
        console.error("Error activating Marco audio:", error);
        setHasError(true);
        toast.error("Fout bij het activeren van Marco audio");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      toast.success("Ademhaling gereset");
    }
  };

  return (
    <div className="space-y-3 w-full max-w-xs mx-auto mt-6">
      <div className="grid grid-cols-2 gap-3 w-full">
        <Button 
          onClick={handleVeraClick} 
          disabled={loading}
          variant={isActive && activeVoice === "vera" ? "secondary" : "default"}
          size="lg"
          className={`w-full ${isActive && activeVoice === "vera" ? "bg-tranquil-600" : "bg-tranquil-500"} hover:bg-tranquil-600 border-none`}
        >
          {isActive && activeVoice === "vera" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          Vera
        </Button>
        
        <Button 
          onClick={handleMarcoClick} 
          disabled={loading}
          variant={isActive && activeVoice === "marco" ? "secondary" : "default"}
          size="lg"
          className={`w-full ${isActive && activeVoice === "marco" ? "bg-tranquil-600" : "bg-tranquil-500"} hover:bg-tranquil-600 border-none`}
        >
          {isActive && activeVoice === "marco" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          Marco
        </Button>
      </div>
      
      {onReset && (
        <Button 
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="w-full bg-transparent border-tranquil-300 text-tranquil-700 hover:bg-tranquil-100/30"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      )}
      
      {hasError && (
        <div className="col-span-2 text-red-500 text-xs text-center mt-1">
          Fout bij het afspelen van audio. Controleer de URL.
        </div>
      )}
    </div>
  );
};
