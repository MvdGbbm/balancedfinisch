
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Validate URLs for a voice set
  const validateUrls = (urls: VoiceUrls): boolean => {
    if (!urls.inhale || !urls.hold || !urls.exhale) {
      return false;
    }
    
    return true;
  };

  // Pre-cache audio files to ensure they're loaded before playback
  useEffect(() => {
    const preloadVoiceAudio = async (urlSet: VoiceUrls, voiceName: string) => {
      if (!validateUrls(urlSet)) {
        console.log(`${voiceName} voice URLs are incomplete`);
        return;
      }
      
      try {
        // Validate and test each URL
        const inhaleResult = await preloadAudio(urlSet.inhale);
        const holdResult = await preloadAudio(urlSet.hold);
        const exhaleResult = await preloadAudio(urlSet.exhale);
        
        if (inhaleResult && holdResult && exhaleResult) {
          console.log(`${voiceName} voice audio files preloaded successfully`);
        } else {
          console.error(`Failed to preload ${voiceName} voice audio files`);
        }
      } catch (error) {
        console.error(`Error preloading ${voiceName} voice audio:`, error);
      }
    };
    
    if (validateUrls(veraUrls)) {
      preloadVoiceAudio(veraUrls, "Vera");
    }
    
    if (validateUrls(marcoUrls)) {
      preloadVoiceAudio(marcoUrls, "Marco");
    }
  }, [veraUrls, marcoUrls]);

  // Handler for Vera voice button
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
        // Test audio files before activation
        const [inhaleTest, holdTest, exhaleTest] = await Promise.all([
          preloadAudio(veraUrls.inhale),
          preloadAudio(veraUrls.hold),
          preloadAudio(veraUrls.exhale)
        ]);
        
        if (!inhaleTest || !holdTest || !exhaleTest) {
          throw new Error("Kon niet alle audio bestanden laden");
        }
        
        onPlay("vera");
        toast.success("Vera stem geactiveerd");
        console.log("Vera audio activated with URLs:", veraUrls);
        setHasError(false);
      } catch (error) {
        console.error("Error activating Vera audio:", error);
        setHasError(true);
        toast.error("Fout bij het activeren van Vera audio. Controleer of alle URL's correct zijn.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handler for Marco voice button
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
        // Test audio files before activation
        const [inhaleTest, holdTest, exhaleTest] = await Promise.all([
          preloadAudio(marcoUrls.inhale),
          preloadAudio(marcoUrls.hold),
          preloadAudio(marcoUrls.exhale)
        ]);
        
        if (!inhaleTest || !holdTest || !exhaleTest) {
          throw new Error("Kon niet alle audio bestanden laden");
        }
        
        onPlay("marco");
        toast.success("Marco stem geactiveerd");
        console.log("Marco audio activated with URLs:", marcoUrls);
        setHasError(false);
      } catch (error) {
        console.error("Error activating Marco audio:", error);
        setHasError(true);
        toast.error("Fout bij het activeren van Marco audio. Controleer of alle URL's correct zijn.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Reset handler
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
        <div className="text-red-500 text-xs text-center mt-1">
          Fout bij het afspelen van audio. Controleer of alle URL's correct zijn en of de audio bestanden bestaan.
        </div>
      )}
      
      {/* Hidden audio element to handle preloading */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};
