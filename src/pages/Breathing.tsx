import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { BreathingMusicPlayer } from "@/components/breathing/breathing-music-player";
import { BreathingPattern } from "@/lib/types";
import { RefreshCw } from "lucide-react";
import BreathingAnimation from "@/components/breathing/breathing-animation";
import { BreathingVoicePlayer } from "@/components/breathing/breathing-voice-player";

const Breathing = () => {
  const [breathingPatterns, setBreathingPatterns] = useState<BreathingPattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTechnique, setSelectedTechnique] = useState<"4-7-8" | "box-breathing" | "diaphragmatic">("4-7-8");
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [activeVoice, setActiveVoice] = useState<"vera" | "marco" | null>(null);

  // Voice URLs for different techniques
  const techniqueVoiceUrls = {
    "4-7-8": {
      vera: "/audio/vera-478.mp3",
      marco: "/audio/marco-478.mp3"
    },
    "box-breathing": {
      vera: "/audio/vera-box.mp3",
      marco: "/audio/marco-box.mp3"
    },
    "diaphragmatic": {
      vera: "/audio/vera-diaphragmatic.mp3",
      marco: "/audio/marco-diaphragmatic.mp3"
    }
  };

  // Load breathing patterns from localStorage (keeping for potential future use)
  useEffect(() => {
    const loadPatterns = () => {
      setIsLoading(true);
      try {
        const savedPatterns = localStorage.getItem('breathingPatterns');
        if (savedPatterns) {
          const patterns = JSON.parse(savedPatterns);
          setBreathingPatterns(patterns);
          if (patterns.length > 0) {
            setSelectedPattern(patterns[0]);
          }
        }
      } catch (error) {
        console.error("Error loading breathing patterns:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPatterns();
  }, []);

  const handleVoicePlay = (voice: "vera" | "marco") => {
    setIsVoiceActive(true);
    setActiveVoice(voice);
  };

  const handleVoicePause = () => {
    setIsVoiceActive(false);
    setActiveVoice(null);
  };
  
  // Get current voice URLs based on selected technique
  const getVoiceUrls = () => {
    return {
      vera: techniqueVoiceUrls[selectedTechnique].vera,
      marco: techniqueVoiceUrls[selectedTechnique].marco
    };
  };

  return (
    <MobileLayout>
      <div className="space-y-6 animate-fade-in min-h-full p-4 rounded-lg bg-gradient-to-br from-navy-950 to-indigo-950">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-2xl font-bold text-center text-white">Ademhalingsoefeningen</h1>
          
          <div className="flex items-center gap-2 mb-2 text-white">
            <RefreshCw className="text-blue-400 h-5 w-5" />
            <h2 className="text-lg font-medium">Ademhalingsoefening</h2>
          </div>
          
          <div className="mb-4 w-full max-w-xs">
            <select
              value={selectedTechnique}
              onChange={(e) => setSelectedTechnique(e.target.value as any)}
              className="w-full p-2 rounded-lg bg-navy-900 text-white border border-white/20"
            >
              <option value="4-7-8">4-7-8 Ademtechniek</option>
              <option value="box-breathing">Box Breathing</option>
              <option value="diaphragmatic">Diafragmatische ademhaling</option>
            </select>
          </div>
          
          <BreathingAnimation 
            technique={selectedTechnique} 
          />
          
          {/* Voice player */}
          <BreathingVoicePlayer 
            veraUrl={getVoiceUrls().vera}
            marcoUrl={getVoiceUrls().marco}
            isActive={isVoiceActive}
            onPause={handleVoicePause}
            onPlay={handleVoicePlay}
            activeVoice={activeVoice}
          />
        </div>
        
        <BreathingMusicPlayer />
      </div>
    </MobileLayout>
  );
};

export default Breathing;
