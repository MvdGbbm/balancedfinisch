import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { BreathingMusicPlayer } from "@/components/breathing/breathing-music-player";
import { BreathingPattern } from "@/lib/types";
import { RefreshCw } from "lucide-react";
import BreathingAnimation from "@/components/breathing/breathing-animation";
import { BreathingVoicePlayer } from "@/components/breathing/breathing-voice-player";
import { validateAudioUrl, preloadAudio } from "@/components/audio-player/utils";

const Breathing = () => {
  const [breathingPatterns, setBreathingPatterns] = useState<BreathingPattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTechnique, setSelectedTechnique] = useState<"4-7-8" | "box-breathing" | "diaphragmatic">("4-7-8");
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [activeVoice, setActiveVoice] = useState<"vera" | "marco" | null>(null);
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [totalCycles, setTotalCycles] = useState<number>(5);
  const [currentPhase, setCurrentPhase] = useState<string>("Inademen");

  const techniqueVoiceUrls = {
    "4-7-8": {
      vera: {
        inhale: "https://lxsltsktjzgmoqwarhps.supabase.co/storage/v1/object/public/voice/Vera%20-%20Adem%20in.mp3",
        hold: "https://lxsltsktjzgmoqwarhps.supabase.co/storage/v1/object/public/voice/vasthouden%20Vera.mp3",
        exhale: "https://lxsltsktjzgmoqwarhps.supabase.co/storage/v1/object/public/voice/Adem%20uit%20Vera.mp3"
      },
      marco: {
        inhale: "https://lxsltsktjzgmoqwarhps.supabase.co/storage/v1/object/public/voice/Marco%20-%20Adem%20in.mp3",
        hold: "https://lxsltsktjzgmoqwarhps.supabase.co/storage/v1/object/public/voice/Vasthouden%20Marco.mp3",
        exhale: "https://lxsltsktjzgmoqwarhps.supabase.co/storage/v1/object/public/voice/Adem%20uit%20Marco.mp3"
      }
    },
    "box-breathing": {
      vera: {
        inhale: "https://lxsltsktjzgmoqwarhps.supabase.co/storage/v1/object/public/voice/Vera%20-%20Adem%20in.mp3",
        hold: "https://lxsltsktjzgmoqwarhps.supabase.co/storage/v1/object/public/voice/vasthouden%20Vera.mp3",
        exhale: "https://lxsltsktjzgmoqwarhps.supabase.co/storage/v1/object/public/voice/Adem%20uit%20Vera.mp3"
      },
      marco: {
        inhale: "https://lxsltsktjzgmoqwarhps.supabase.co/storage/v1/object/public/voice/Marco%20-%20Adem%20in.mp3",
        hold: "https://lxsltsktjzgmoqwarhps.supabase.co/storage/v1/object/public/voice/Vasthouden%20Marco.mp3",
        exhale: "https://lxsltsktjzgmoqwarhps.supabase.co/storage/v1/object/public/voice/Adem%20uit%20Marco.mp3"
      }
    },
    "diaphragmatic": {
      vera: {
        inhale: "https://lxsltsktjzgmoqwarhps.supabase.co/storage/v1/object/public/voice/Vera%20-%20Adem%20in.mp3",
        hold: "https://lxsltsktjzgmoqwarhps.supabase.co/storage/v1/object/public/voice/vasthouden%20Vera.mp3",
        exhale: "https://lxsltsktjzgmoqwarhps.supabase.co/storage/v1/object/public/voice/Adem%20uit%20Vera.mp3"
      },
      marco: {
        inhale: "https://lxsltsktjzgmoqwarhps.supabase.co/storage/v1/object/public/voice/Marco%20-%20Adem%20in.mp3",
        hold: "https://lxsltsktjzgmoqwarhps.supabase.co/storage/v1/object/public/voice/Vasthouden%20Marco.mp3",
        exhale: "https://lxsltsktjzgmoqwarhps.supabase.co/storage/v1/object/public/voice/Adem%20uit%20Marco.mp3"
      }
    }
  };

  useEffect(() => {
    Object.values(techniqueVoiceUrls).forEach(technique => {
      Object.values(technique).forEach(voice => {
        Object.values(voice).forEach(url => {
          if (url) {
            preloadAudio(validateAudioUrl(url));
          }
        });
      });
    });
  }, []);

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
            setTotalCycles(patterns[0].cycles || 5);
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
    setCurrentCycle(1);
    setCurrentPhase("Inademen");
    console.log(`Activating ${voice} voice for ${selectedTechnique}`, 
      techniqueVoiceUrls[selectedTechnique][voice]);
  };

  const handleVoicePause = () => {
    setIsVoiceActive(false);
    setActiveVoice(null);
  };
  
  const handleReset = () => {
    handleVoicePause();
    setCurrentCycle(1);
    setCurrentPhase("Inademen");
  };
  
  useEffect(() => {
    if (!isVoiceActive) return;
    
    const phaseTimer = setTimeout(() => {
      if (currentPhase === "Inademen") {
        setCurrentPhase("Vasthouden");
      } else if (currentPhase === "Vasthouden") {
        setCurrentPhase("Uitademen");
      } else if (currentPhase === "Uitademen") {
        if (currentCycle < totalCycles) {
          setCurrentCycle(prev => prev + 1);
          setCurrentPhase("Inademen");
        } else {
          handleVoicePause();
          setCurrentCycle(1);
          setCurrentPhase("Inademen");
        }
      }
    }, 4000);
    
    return () => clearTimeout(phaseTimer);
  }, [isVoiceActive, currentPhase, currentCycle, totalCycles]);
  
  useEffect(() => {
    if (activeVoice) {
      const voiceUrls = techniqueVoiceUrls[selectedTechnique][activeVoice];
      console.log(`Active voice URLs for ${activeVoice}:`, voiceUrls);
    }
  }, [activeVoice, selectedTechnique]);
  
  return (
    <MobileLayout>
      <div className="space-y-6 animate-fade-in min-h-full p-4 rounded-lg bg-gradient-to-br from-navy-950 to-indigo-950">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-2xl font-bold text-center text-white">Ademhalingsoefeningen</h1>
          
          <div className="mb-4 w-full max-w-xs">
            <select
              value={selectedTechnique}
              onChange={(e) => setSelectedTechnique(e.target.value as any)}
              className="w-full p-2 rounded-lg bg-slate-800 text-white border border-white/20"
              disabled={isVoiceActive}
            >
              <option value="4-7-8">4-7-8 Ademtechniek</option>
              <option value="box-breathing">Box Breathing</option>
              <option value="diaphragmatic">Diafragmatische ademhaling</option>
            </select>
          </div>
          
          {isVoiceActive && activeVoice && (
            <BreathingAnimation 
              technique={selectedTechnique}
              voiceUrls={techniqueVoiceUrls[selectedTechnique][activeVoice]}
              isVoiceActive={isVoiceActive}
              currentPhase={currentPhase}
            />
          )}
          
          <BreathingVoicePlayer 
            veraUrls={techniqueVoiceUrls[selectedTechnique].vera}
            marcoUrls={techniqueVoiceUrls[selectedTechnique].marco}
            isActive={isVoiceActive}
            onPause={handleVoicePause}
            onPlay={handleVoicePlay}
            activeVoice={activeVoice}
            onReset={handleReset}
            currentCycle={currentCycle}
            totalCycles={totalCycles}
            currentPhase={currentPhase}
          />
        </div>
        
        <BreathingMusicPlayer />
      </div>
    </MobileLayout>
  );
};

export default Breathing;
