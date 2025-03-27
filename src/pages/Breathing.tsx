import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { BreathingMusicPlayer } from "@/components/breathing/breathing-music-player";
import { BreathingPattern } from "@/lib/types";
import { RefreshCw } from "lucide-react";
import BreathingAnimation from "@/components/breathing/breathing-animation";
import { BreathingVoicePlayer } from "@/components/breathing/breathing-voice-player";
import { validateAudioUrl, preloadAudio } from "@/components/audio-player/utils";
import { toast } from "sonner";

const Breathing = () => {
  const [breathingPatterns, setBreathingPatterns] = useState<BreathingPattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTechnique, setSelectedTechnique] = useState<"4-7-8" | "box-breathing" | "diaphragmatic">("4-7-8");
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [activeVoice, setActiveVoice] = useState<"vera" | "marco" | null>(null);

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
    Object.keys(techniqueVoiceUrls).forEach(technique => {
      preloadAudio(techniqueVoiceUrls[technique as keyof typeof techniqueVoiceUrls].vera.inhale);
      preloadAudio(techniqueVoiceUrls[technique as keyof typeof techniqueVoiceUrls].vera.hold);
      preloadAudio(techniqueVoiceUrls[technique as keyof typeof techniqueVoiceUrls].vera.exhale);
      
      preloadAudio(techniqueVoiceUrls[technique as keyof typeof techniqueVoiceUrls].marco.inhale);
      preloadAudio(techniqueVoiceUrls[technique as keyof typeof techniqueVoiceUrls].marco.hold);
      preloadAudio(techniqueVoiceUrls[technique as keyof typeof techniqueVoiceUrls].marco.exhale);
    });
    
    console.log("Preloading all breathing audio files");
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
    console.log(`Activating ${voice} voice for ${selectedTechnique}`, 
      techniqueVoiceUrls[selectedTechnique][voice]);
    
    const urls = techniqueVoiceUrls[selectedTechnique][voice];
    const validInhale = validateAudioUrl(urls.inhale);
    const validHold = validateAudioUrl(urls.hold);
    const validExhale = validateAudioUrl(urls.exhale);
    
    console.log("Validated URLs for breathing:");
    console.log("Inhale:", validInhale);
    console.log("Hold:", validHold);
    console.log("Exhale:", validExhale);
    
    preloadAudio(validInhale);
    preloadAudio(validHold);
    preloadAudio(validExhale);
  };

  const handleVoicePause = () => {
    setIsVoiceActive(false);
    setActiveVoice(null);
    toast.info("Ademhalingsoefening gepauzeerd");
  };
  
  const handleTechniqueChange = (technique: "4-7-8" | "box-breathing" | "diaphragmatic") => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      setActiveVoice(null);
    }
    
    setSelectedTechnique(technique);
    toast.info(`Ademhalingstechniek gewijzigd naar ${technique}`);
    
    const veraUrls = techniqueVoiceUrls[technique].vera;
    const marcoUrls = techniqueVoiceUrls[technique].marco;
    
    preloadAudio(veraUrls.inhale);
    preloadAudio(veraUrls.hold);
    preloadAudio(veraUrls.exhale);
    preloadAudio(marcoUrls.inhale);
    preloadAudio(marcoUrls.hold);
    preloadAudio(marcoUrls.exhale);
  };
  
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
          
          <div className="flex items-center gap-2 mb-2 text-white">
            <RefreshCw className="text-blue-400 h-5 w-5" />
            <h2 className="text-lg font-medium">Ademhalingsoefening</h2>
          </div>
          
          <div className="mb-4 w-full max-w-xs">
            <select
              value={selectedTechnique}
              onChange={(e) => handleTechniqueChange(e.target.value as any)}
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
            />
          )}
          
          {!isVoiceActive && (
            <div className="p-6 text-center bg-blue-900/30 rounded-lg border border-blue-800/50 mb-4">
              <p className="text-white font-medium">Selecteer Vera of Marco hieronder om te beginnen</p>
            </div>
          )}
          
          <BreathingVoicePlayer 
            veraUrls={techniqueVoiceUrls[selectedTechnique].vera}
            marcoUrls={techniqueVoiceUrls[selectedTechnique].marco}
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
