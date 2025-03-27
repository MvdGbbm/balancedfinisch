
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { validateAudioUrl, preloadAudio } from "@/components/audio-player/utils";
interface VoiceUrls {
  start?: string;
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
  headerText?: string;
}
export const BreathingVoicePlayer: React.FC<BreathingVoicePlayerProps> = ({
  veraUrls,
  marcoUrls,
  isActive,
  onPause,
  onPlay,
  activeVoice,
  onReset,
  headerText
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
        const urlsToPreload = [urlSet.inhale, urlSet.hold, urlSet.exhale];
        if (urlSet.start) {
          urlsToPreload.push(urlSet.start);
        }
        
        const preloadPromises = urlsToPreload.map(url => preloadAudio(url));
        const preloadResults = await Promise.all(preloadPromises);
        
        const allPreloaded = preloadResults.every(result => result === true);
        
        if (allPreloaded) {
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
        const urlsToTest = [veraUrls.inhale, veraUrls.hold, veraUrls.exhale];
        if (veraUrls.start) {
          urlsToTest.push(veraUrls.start);
        }
        
        const testPromises = urlsToTest.map(url => preloadAudio(url));
        const testResults = await Promise.all(testPromises);
        
        const allValid = testResults.every(result => result === true);
        
        if (!allValid) {
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
        const urlsToTest = [marcoUrls.inhale, marcoUrls.hold, marcoUrls.exhale];
        if (marcoUrls.start) {
          urlsToTest.push(marcoUrls.start);
        }
        
        const testPromises = urlsToTest.map(url => preloadAudio(url));
        const testResults = await Promise.all(testPromises);
        
        const allValid = testResults.every(result => result === true);
        
        if (!allValid) {
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
  return <div className="space-y-3 w-full max-w-xs mx-auto mt-6 my-0 py-0 rounded-none">
      {headerText && (
        <h3 className="text-center text-sm text-white/80 mb-2">{headerText}</h3>
      )}
      <div className="grid grid-cols-2 gap-3 w-full">
        <Button onClick={handleVeraClick} disabled={loading} variant="outline" size="sm" className={`w-full flex items-center justify-center gap-2 rounded-full h-10 border border-tranquil-300/20 
          ${isActive && activeVoice === "vera" ? "bg-teal-700/90 text-white shadow-inner" : "bg-navy-900/80 text-white/80 hover:bg-teal-700/70 hover:text-white"}`}>
          {isActive && activeVoice === "vera" ? <Pause className="h-3.5 w-3.5 opacity-90" /> : <Play className="h-3.5 w-3.5 opacity-90" />}
          <span className="text-sm font-medium">Vera</span>
        </Button>
        
        <Button onClick={handleMarcoClick} disabled={loading} variant="outline" size="sm" className={`w-full flex items-center justify-center gap-2 rounded-full h-10 border border-tranquil-300/20
          ${isActive && activeVoice === "marco" ? "bg-teal-700/90 text-white shadow-inner" : "bg-navy-900/80 text-white/80 hover:bg-teal-700/70 hover:text-white"}`}>
          {isActive && activeVoice === "marco" ? <Pause className="h-3.5 w-3.5 opacity-90" /> : <Play className="h-3.5 w-3.5 opacity-90" />}
          <span className="text-sm font-medium">Marco</span>
        </Button>
      </div>
      
      {onReset && <Button onClick={handleReset} variant="outline" size="sm" className="w-full flex items-center justify-center gap-2 py-2 h-9 rounded-full border-white/10 
                    bg-transparent hover:bg-navy-900/80 text-white/70 hover:text-white">
          <RefreshCw className="h-3.5 w-3.5 opacity-80" />
          <span className="text-sm font-medium">Reset</span>
        </Button>}
      
      {hasError && <div className="text-red-500 text-xs text-center mt-1">
          Fout bij het afspelen van audio. Controleer of alle URL's correct zijn en of de audio bestanden bestaan.
        </div>}
      
      {/* Hidden audio element to handle preloading */}
      <audio ref={audioRef} style={{
      display: 'none'
    }} />
    </div>;
};
