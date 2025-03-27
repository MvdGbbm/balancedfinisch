
import React, { useState, useEffect, useRef } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { BreathingMusicPlayer } from "@/components/breathing/breathing-music-player";
import { BreathingPattern } from "@/lib/types";
import { RefreshCw } from "lucide-react";
import BreathingAnimation from "@/components/breathing/breathing-animation";
import { BreathingVoicePlayer } from "@/components/breathing/breathing-voice-player";
import { validateAudioUrl, preloadAudio } from "@/components/audio-player/utils";
import { toast } from "sonner";

const Breathing = () => {
  // Set up state for patterns, selected pattern, etc.
  const [breathingPatterns, setBreathingPatterns] = useState<BreathingPattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTechnique, setSelectedTechnique] = useState<"4-7-8" | "box-breathing" | "diaphragmatic">("4-7-8");
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [activeVoice, setActiveVoice] = useState<"vera" | "marco" | null>(null);
  const [currentPhase, setCurrentPhase] = useState<string>("Gereed");
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [totalCycles, setTotalCycles] = useState<number>(4);
  
  // Reference to track if component is mounted
  const isMounted = useRef(true);

  // Voice URL structures for different techniques
  const [techniqueVoiceUrls, setTechniqueVoiceUrls] = useState({
    "4-7-8": {
      vera: {
        inhale: "",
        hold: "",
        exhale: ""
      },
      marco: {
        inhale: "",
        hold: "",
        exhale: ""
      }
    },
    "box-breathing": {
      vera: {
        inhale: "",
        hold: "",
        exhale: ""
      },
      marco: {
        inhale: "",
        hold: "",
        exhale: ""
      }
    },
    "diaphragmatic": {
      vera: {
        inhale: "",
        hold: "",
        exhale: ""
      },
      marco: {
        inhale: "",
        hold: "",
        exhale: ""
      }
    }
  });

  // Handle component unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load stored voice URLs from localStorage
  useEffect(() => {
    try {
      // Default fallback URLs in case configuration is missing
      const defaultVoiceUrls = {
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

      // Create a deep copy of the default URLs
      const updatedTechniqueUrls = JSON.parse(JSON.stringify(defaultVoiceUrls));
      
      // Try to load custom voice URLs for each technique
      for (const technique of ["4-7-8", "box-breathing", "diaphragmatic"] as const) {
        // Load Vera voice URLs for this technique
        const veraKey = `veraVoiceUrls_${technique}`;
        const savedVeraUrls = localStorage.getItem(veraKey);
        if (savedVeraUrls) {
          const parsedUrls = JSON.parse(savedVeraUrls);
          if (parsedUrls.inhale && parsedUrls.hold && parsedUrls.exhale) {
            updatedTechniqueUrls[technique].vera = parsedUrls;
            console.log(`Loaded custom Vera URLs for ${technique}:`, parsedUrls);
          }
        }
        
        // Load Marco voice URLs for this technique
        const marcoKey = `marcoVoiceUrls_${technique}`;
        const savedMarcoUrls = localStorage.getItem(marcoKey);
        if (savedMarcoUrls) {
          const parsedUrls = JSON.parse(savedMarcoUrls);
          if (parsedUrls.inhale && parsedUrls.hold && parsedUrls.exhale) {
            updatedTechniqueUrls[technique].marco = parsedUrls;
            console.log(`Loaded custom Marco URLs for ${technique}:`, parsedUrls);
          }
        }
      }
      
      // Update state with the loaded URLs
      setTechniqueVoiceUrls(updatedTechniqueUrls);
    } catch (error) {
      console.error("Error loading voice URLs from localStorage:", error);
      // Default URLs will remain from initial state
    }
  }, []);

  // Preload audio files to prevent delay
  useEffect(() => {
    const techniques = Object.keys(techniqueVoiceUrls) as Array<keyof typeof techniqueVoiceUrls>;
    
    techniques.forEach(technique => {
      preloadAudio(techniqueVoiceUrls[technique].vera.inhale);
      preloadAudio(techniqueVoiceUrls[technique].vera.hold);
      preloadAudio(techniqueVoiceUrls[technique].vera.exhale);
      
      preloadAudio(techniqueVoiceUrls[technique].marco.inhale);
      preloadAudio(techniqueVoiceUrls[technique].marco.hold);
      preloadAudio(techniqueVoiceUrls[technique].marco.exhale);
    });
    
    console.log("Preloading all breathing audio files");
  }, [techniqueVoiceUrls]);

  // Load breathing patterns
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
            
            // Set total cycles based on the selected pattern
            const defaultPattern = patterns.find(p => p.name.includes("4-7-8")) || patterns[0];
            setTotalCycles(defaultPattern.cycles || 4);
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

  // Handle voice activation
  const handleVoicePlay = (voice: "vera" | "marco") => {
    setIsVoiceActive(true);
    setActiveVoice(voice);
    setCurrentPhase("Adem in");
    setCurrentCycle(1);
    
    console.log(`Activating ${voice} voice for ${selectedTechnique}`, 
      techniqueVoiceUrls[selectedTechnique][voice]);
    
    const urls = techniqueVoiceUrls[selectedTechnique][voice];
    
    // Validate and preload the audio files
    const validInhale = validateAudioUrl(urls.inhale);
    const validHold = validateAudioUrl(urls.hold);
    const validExhale = validateAudioUrl(urls.exhale);
    
    console.log("Using validated URLs for breathing:");
    console.log("Inhale:", validInhale);
    console.log("Hold:", validHold);
    console.log("Exhale:", validExhale);
    
    preloadAudio(validInhale);
    preloadAudio(validHold);
    preloadAudio(validExhale);
  };

  // Handle voice pause
  const handleVoicePause = () => {
    setIsVoiceActive(false);
    setActiveVoice(null);
    setCurrentPhase("Gepauzeerd");
    toast.info("Ademhalingsoefening gepauzeerd");
  };
  
  // Handle reset
  const handleReset = () => {
    setIsVoiceActive(false);
    setActiveVoice(null);
    setCurrentPhase("Gereed");
    setCurrentCycle(1);
    toast.info("Ademhalingsoefening gereset");
  };
  
  // Handle technique change
  const handleTechniqueChange = (technique: "4-7-8" | "box-breathing" | "diaphragmatic") => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      setActiveVoice(null);
      setCurrentPhase("Gereed");
    }
    
    setSelectedTechnique(technique);
    toast.info(`Ademhalingstechniek gewijzigd naar ${technique}`);
    
    // Set total cycles based on the selected technique
    const pattern = breathingPatterns.find(p => {
      if (technique === "4-7-8" && p.name.includes("4-7-8")) return true;
      if (technique === "box-breathing" && p.name.toLowerCase().includes("box")) return true;
      if (technique === "diaphragmatic" && p.name.toLowerCase().includes("diaphragm")) return true;
      return false;
    });
    
    if (pattern) {
      setTotalCycles(pattern.cycles || 4);
    } else {
      // Default cycles if no matching pattern found
      setTotalCycles(technique === "4-7-8" ? 5 : technique === "box-breathing" ? 4 : 6);
    }
    
    // Preload the audio for the selected technique
    const veraUrls = techniqueVoiceUrls[technique].vera;
    const marcoUrls = techniqueVoiceUrls[technique].marco;
    
    preloadAudio(veraUrls.inhale);
    preloadAudio(veraUrls.hold);
    preloadAudio(veraUrls.exhale);
    preloadAudio(marcoUrls.inhale);
    preloadAudio(marcoUrls.hold);
    preloadAudio(marcoUrls.exhale);
  };
  
  // Update active voice URLs for debugging
  useEffect(() => {
    if (activeVoice) {
      const voiceUrls = techniqueVoiceUrls[selectedTechnique][activeVoice];
      console.log(`Active voice URLs for ${activeVoice}:`, voiceUrls);
    }
  }, [activeVoice, selectedTechnique, techniqueVoiceUrls]);
  
  // Update the currentPhase based on animation feedback
  const handlePhaseChange = (phase: string) => {
    if (isMounted.current) {
      setCurrentPhase(phase);
    }
  };
  
  // Update the currentCycle based on animation feedback
  const handleCycleChange = (cycle: number) => {
    if (isMounted.current) {
      setCurrentCycle(cycle);
    }
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
              onPhaseChange={handlePhaseChange}
              onCycleChange={handleCycleChange}
              currentPhase={currentPhase}
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
            onReset={handleReset}
            currentPhase={currentPhase}
            currentCycle={currentCycle}
            totalCycles={totalCycles}
          />
        </div>
        
        <BreathingMusicPlayer />
      </div>
    </MobileLayout>
  );
};

export default Breathing;
