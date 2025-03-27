
import React, { useState, useEffect, useRef } from "react";
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Validate URLs for a voice set
  const validateUrls = (urls: VoiceUrls): boolean => {
    return Boolean(urls.inhale && urls.hold && urls.exhale);
  };

  // Pre-cache audio files to ensure they're loaded before playback
  useEffect(() => {
    const preloadAudio = async (urlSet: VoiceUrls) => {
      if (!validateUrls(urlSet)) return;
      
      try {
        // Create temporary audio elements to preload the files
        const inhaleAudio = new Audio(urlSet.inhale);
        const holdAudio = new Audio(urlSet.hold);
        const exhaleAudio = new Audio(urlSet.exhale);
        
        // Load the audio files
        const loadPromises = [
          new Promise(resolve => {
            inhaleAudio.addEventListener('canplaythrough', resolve, { once: true });
            inhaleAudio.addEventListener('error', () => {
              console.error('Error loading inhale audio');
              resolve(null);
            }, { once: true });
            inhaleAudio.load();
          }),
          new Promise(resolve => {
            holdAudio.addEventListener('canplaythrough', resolve, { once: true });
            holdAudio.addEventListener('error', () => {
              console.error('Error loading hold audio');
              resolve(null);
            }, { once: true });
            holdAudio.load();
          }),
          new Promise(resolve => {
            exhaleAudio.addEventListener('canplaythrough', resolve, { once: true });
            exhaleAudio.addEventListener('error', () => {
              console.error('Error loading exhale audio');
              resolve(null);
            }, { once: true });
            exhaleAudio.load();
          })
        ];
        
        // Wait for all audio files to load
        await Promise.all(loadPromises);
        console.log('Audio files preloaded successfully');
      } catch (error) {
        console.error('Failed to preload audio files:', error);
      }
    };
    
    if (validateUrls(veraUrls)) {
      preloadAudio(veraUrls);
    }
    
    if (validateUrls(marcoUrls)) {
      preloadAudio(marcoUrls);
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
        // Pre-load audio files
        const verifyInhale = await fetch(veraUrls.inhale, { method: 'HEAD' }).catch(() => ({ ok: false }));
        const verifyHold = await fetch(veraUrls.hold, { method: 'HEAD' }).catch(() => ({ ok: false }));
        const verifyExhale = await fetch(veraUrls.exhale, { method: 'HEAD' }).catch(() => ({ ok: false }));
        
        if (!verifyInhale.ok || !verifyHold.ok || !verifyExhale.ok) {
          throw new Error("Kon niet alle audio bestanden verifiëren");
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
        // Pre-load audio files
        const verifyInhale = await fetch(marcoUrls.inhale, { method: 'HEAD' }).catch(() => ({ ok: false }));
        const verifyHold = await fetch(marcoUrls.hold, { method: 'HEAD' }).catch(() => ({ ok: false }));
        const verifyExhale = await fetch(marcoUrls.exhale, { method: 'HEAD' }).catch(() => ({ ok: false }));
        
        if (!verifyInhale.ok || !verifyHold.ok || !verifyExhale.ok) {
          throw new Error("Kon niet alle audio bestanden verifiëren");
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
        <div className="col-span-2 text-red-500 text-xs text-center mt-1">
          Fout bij het afspelen van audio. Controleer of alle URL's correct zijn en of de audio bestanden bestaan.
        </div>
      )}
      
      {/* Hidden audio element to handle preloading */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};
