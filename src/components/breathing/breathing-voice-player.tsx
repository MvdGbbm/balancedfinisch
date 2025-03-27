
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";
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

  // Validate URLs for a voice set
  const validateUrls = (urls: VoiceUrls): boolean => {
    return Boolean(urls.inhale && urls.hold && urls.exhale);
  };

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
        <div className="mt-4 p-2 bg-card/20 rounded-md border border-border/40">
          <h4 className="text-sm font-medium mb-2">Test audio:</h4>
          
          {/* Vera voice previews */}
          {validateUrls(veraUrls) && (
            <div className="space-y-1 mb-2">
              <div className="text-xs font-semibold mb-1">Vera:</div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => showPreview("vera", "inhale")}
                >
                  Inademen
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => showPreview("vera", "hold")}
                >
                  Vasthouden
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => showPreview("vera", "exhale")}
                >
                  Uitademen
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
                  Inademen
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => showPreview("marco", "hold")}
                >
                  Vasthouden
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => showPreview("marco", "exhale")}
                >
                  Uitademen
                </Button>
              </div>
            </div>
          )}

          {/* Preview player */}
          {previewVoice && previewType && (
            <div className="mt-3">
              <AudioPreview 
                url={getPreviewUrl()} 
                label={`${previewVoice === "vera" ? "Vera" : "Marco"} - ${
                  previewType === "inhale" ? "Inademen" : 
                  previewType === "hold" ? "Vasthouden" : "Uitademen"
                }`}
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
          Fout bij het afspelen van audio. Controleer de URL.
        </div>
      )}
    </div>
  );
};
