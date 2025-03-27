
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { validateAudioUrl } from "@/components/audio-player/utils";
import { AudioPreview } from "@/components/audio-player/audio-preview";

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
  const [previewVoice, setPreviewVoice] = useState<"vera" | "marco" | null>(null);
  const [previewType, setPreviewType] = useState<"inhale" | "hold" | "exhale" | null>(null);
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

  // Show audio preview for a specific voice and audio type
  const showPreview = (voice: "vera" | "marco", type: "inhale" | "hold" | "exhale") => {
    setPreviewVoice(voice);
    setPreviewType(type);
    
    // Create a URL for testing
    const urls = voice === "vera" ? veraUrls : marcoUrls;
    const url = urls[type];
    
    if (!url) {
      toast.error(`Geen ${type} URL voor ${voice}`);
      return;
    }
    
    console.log(`Testing ${voice} ${type} audio: ${url}`);
    
    // Test the URL with a HEAD request before playing
    fetch(url, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
      })
      .then(() => {
        console.log(`${voice} ${type} audio URL is valid`);
      })
      .catch(error => {
        console.error(`Error testing ${voice} ${type} audio:`, error);
        toast.error(`Fout bij laden van ${voice} ${type} audio. Controleer de URL.`);
      });
  };

  // Close the preview
  const closePreview = () => {
    setPreviewVoice(null);
    setPreviewType(null);
  };

  // Get the URL for the current preview
  const getPreviewUrl = (): string => {
    if (!previewVoice || !previewType) return "";
    
    const urls = previewVoice === "vera" ? veraUrls : marcoUrls;
    return urls[previewType] || "";
  };

  // Format button label based on voice and type
  const getButtonLabel = (type: "inhale" | "hold" | "exhale"): string => {
    switch (type) {
      case "inhale":
        return "Inademen";
      case "hold":
        return "Vasthouden";
      case "exhale":
        return "Uitademen";
      default:
        return type;
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

      {/* Audio preview section */}
      {(validateUrls(veraUrls) || validateUrls(marcoUrls)) && (
        <div className="mt-4 p-3 bg-card/20 rounded-md border border-border/40">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Volume2 className="h-4 w-4 mr-1" />
            Test audio:
          </h4>
          
          {/* Vera voice previews */}
          {validateUrls(veraUrls) && (
            <div className="space-y-1 mb-3">
              <div className="text-xs font-semibold mb-1">Vera:</div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => showPreview("vera", "inhale")}
                >
                  {getButtonLabel("inhale")}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => showPreview("vera", "hold")}
                >
                  {getButtonLabel("hold")}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => showPreview("vera", "exhale")}
                >
                  {getButtonLabel("exhale")}
                </Button>
              </div>
            </div>
          )}
          
          {/* Marco voice previews */}
          {validateUrls(marcoUrls) && (
            <div className="space-y-1">
              <div className="text-xs font-semibold mb-1">Marco:</div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => showPreview("marco", "inhale")}
                >
                  {getButtonLabel("inhale")}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => showPreview("marco", "hold")}
                >
                  {getButtonLabel("hold")}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => showPreview("marco", "exhale")}
                >
                  {getButtonLabel("exhale")}
                </Button>
              </div>
            </div>
          )}

          {/* Preview player */}
          {previewVoice && previewType && (
            <div className="mt-3">
              <AudioPreview 
                url={getPreviewUrl()} 
                label={`${previewVoice === "vera" ? "Vera" : "Marco"} - ${getButtonLabel(previewType)}`}
                autoPlay
              />
            </div>
          )}
        </div>
      )}
      
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
