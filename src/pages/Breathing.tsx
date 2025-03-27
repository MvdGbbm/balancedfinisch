
import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { BreathExercise } from "@/components/breathing/breath-exercise";
import { BreathingMusicPlayer } from "@/components/breathing/breathing-music-player";
import BreathingAnimation from "@/components/breathing/breathing-animation";
import { BreathingVoicePlayer } from "@/components/breathing/breathing-voice-player";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioPlayer } from "@/components/audio-player";
import { toast } from "sonner";
import { validateAudioUrl, preloadAudio } from "@/components/audio-player/utils";

// Define types for breathing patterns
type BreathingPattern = {
  id: string;
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number;
  description?: string;
};

// Define voice URL type
type VoiceURLs = {
  inhale: string;
  hold: string;
  exhale: string;
};

// Default patterns
const defaultBreathingPatterns: BreathingPattern[] = [
  {
    id: "1",
    name: "4-7-8 Techniek",
    description: "Een kalmerende ademhalingstechniek die helpt bij ontspanning",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 5,
  },
  {
    id: "2",
    name: "Box Breathing",
    description: "Vierkante ademhaling voor focus en kalmte",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4, 
    cycles: 4,
  },
  {
    id: "3",
    name: "Relaxerende Ademhaling",
    description: "Eenvoudige techniek voor diepe ontspanning",
    inhale: 4,
    hold1: 2,
    exhale: 6,
    hold2: 0,
    cycles: 6,
  },
];

// Default voice URLs
const defaultVoiceUrls: Record<string, VoiceURLs> = {
  vera: {
    inhale: "",
    hold: "",
    exhale: "",
  },
  marco: {
    inhale: "",
    hold: "",
    exhale: "",
  }
};

const Breathing = () => {
  const [breathingPatterns, setBreathingPatterns] = useState<BreathingPattern[]>(defaultBreathingPatterns);
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [activeVoice, setActiveVoice] = useState<"vera" | "marco" | null>(null);
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "hold" | "exhale" | "pause">("inhale");
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Voice URL states
  const [veraVoiceUrls, setVeraVoiceUrls] = useState<VoiceURLs>(defaultVoiceUrls.vera);
  const [marcoVoiceUrls, setMarcoVoiceUrls] = useState<VoiceURLs>(defaultVoiceUrls.marco);
  const [voiceUrlsValidated, setVoiceUrlsValidated] = useState<boolean>(false);

  // Load breathing patterns and voice URLs from localStorage when component mounts
  useEffect(() => {
    // Load breathing patterns
    const savedPatterns = localStorage.getItem('breathingPatterns');
    if (savedPatterns) {
      try {
        const parsedPatterns = JSON.parse(savedPatterns);
        setBreathingPatterns(parsedPatterns);
        // Select the first pattern by default
        if (parsedPatterns.length > 0) {
          setSelectedPattern(parsedPatterns[0]);
        }
      } catch (error) {
        console.error("Error loading breathing patterns:", error);
        setBreathingPatterns(defaultBreathingPatterns);
        setSelectedPattern(defaultBreathingPatterns[0]);
      }
    } else {
      setSelectedPattern(defaultBreathingPatterns[0]);
    }
    
    // Load voice URLs from localStorage
    loadVoiceUrls();
  }, []);

  // Function to load voice URLs from localStorage
  const loadVoiceUrls = async () => {
    // Load Vera voice URLs
    const savedVeraUrls = localStorage.getItem('veraVoiceUrls');
    if (savedVeraUrls) {
      try {
        const parsedUrls = JSON.parse(savedVeraUrls);
        
        // Validate and normalize each URL
        const validatedUrls = {
          inhale: parsedUrls.inhale ? validateAudioUrl(parsedUrls.inhale) : "",
          hold: parsedUrls.hold ? validateAudioUrl(parsedUrls.hold) : "",
          exhale: parsedUrls.exhale ? validateAudioUrl(parsedUrls.exhale) : ""
        };
        
        setVeraVoiceUrls(validatedUrls);
        console.log("Loaded Vera voice URLs:", validatedUrls);
        
        // Pre-validate if the URLs are valid and audio files exist
        await validateAudioFiles(validatedUrls, 'vera');
      } catch (error) {
        console.error("Error loading Vera voice URLs:", error);
        setVeraVoiceUrls(defaultVoiceUrls.vera);
      }
    }
    
    // Load Marco voice URLs
    const savedMarcoUrls = localStorage.getItem('marcoVoiceUrls');
    if (savedMarcoUrls) {
      try {
        const parsedUrls = JSON.parse(savedMarcoUrls);
        
        // Validate and normalize each URL
        const validatedUrls = {
          inhale: parsedUrls.inhale ? validateAudioUrl(parsedUrls.inhale) : "",
          hold: parsedUrls.hold ? validateAudioUrl(parsedUrls.hold) : "",
          exhale: parsedUrls.exhale ? validateAudioUrl(parsedUrls.exhale) : ""
        };
        
        setMarcoVoiceUrls(validatedUrls);
        console.log("Loaded Marco voice URLs:", validatedUrls);
        
        // Pre-validate if the URLs are valid and audio files exist
        await validateAudioFiles(validatedUrls, 'marco');
      } catch (error) {
        console.error("Error loading Marco voice URLs:", error);
        setMarcoVoiceUrls(defaultVoiceUrls.marco);
      }
    }
    
    setVoiceUrlsValidated(true);
  };
  
  // Function to validate audio files exist and are playable
  const validateAudioFiles = async (urls: VoiceURLs, voice: string): Promise<boolean> => {
    if (!urls.inhale || !urls.hold || !urls.exhale) {
      console.log(`${voice} URLs are not complete, skipping validation`);
      return false;
    }
    
    console.log(`Validating ${voice} audio URLs...`);
    
    try {
      // Check all URLs in parallel
      const [inhaleValid, holdValid, exhaleValid] = await Promise.all([
        preloadAudio(urls.inhale),
        preloadAudio(urls.hold),
        preloadAudio(urls.exhale)
      ]);
      
      const allValid = inhaleValid && holdValid && exhaleValid;
      
      if (allValid) {
        console.log(`All ${voice} audio files validated successfully`);
        return true;
      } else {
        console.error(`One or more ${voice} audio files failed validation`);
        return false;
      }
    } catch (error) {
      console.error(`Error validating ${voice} audio files:`, error);
      return false;
    }
  };

  const handleSelectPattern = (pattern: BreathingPattern) => {
    setSelectedPattern(pattern);
    // Reset exercise when selecting a new pattern
    setIsExerciseActive(false);
    setActiveVoice(null);
    setShowAnimation(false);
  };
  
  const handleActivateVoice = async (voice: "vera" | "marco") => {
    const urls = voice === "vera" ? veraVoiceUrls : marcoVoiceUrls;
    
    // Validate URLs before activating
    if (!urls.inhale || !urls.hold || !urls.exhale) {
      toast.error(`${voice === "vera" ? "Vera" : "Marco"} audio URL's ontbreken`);
      return;
    }
    
    const isValid = await validateAudioFiles(urls, voice);
    
    if (!isValid) {
      toast.error(`Fout bij validatie van ${voice === "vera" ? "Vera" : "Marco"} audio bestanden. Controleer of alle URL's correct zijn.`);
      return;
    }
    
    setActiveVoice(voice);
    setIsExerciseActive(true);
    setCurrentPhase("inhale");
    setShowAnimation(true);
    console.log(`Activated ${voice} voice with URLs:`, urls);
  };
  
  const handlePauseVoice = () => {
    setIsExerciseActive(false);
  };
  
  const handleReset = () => {
    setIsExerciseActive(false);
    setActiveVoice(null);
    setCurrentPhase("inhale");
    setShowAnimation(false);
  };
  
  const handlePhaseChange = (phase: "inhale" | "hold" | "exhale" | "pause") => {
    setCurrentPhase(phase);
  };

  return (
    <MobileLayout>
      <div className="container py-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-4">Ademhalingsoefeningen</h1>
        
        <div className="space-y-6">
          {/* Patterns selection */}
          <div className="grid grid-cols-1 gap-3">
            {breathingPatterns.map((pattern) => (
              <Button
                key={pattern.id}
                variant={selectedPattern?.id === pattern.id ? "default" : "outline"}
                className={`w-full justify-start text-left ${
                  selectedPattern?.id === pattern.id 
                    ? "bg-tranquil-400 hover:bg-tranquil-500 border-tranquil-300"
                    : "hover:bg-tranquil-50/50"
                }`}
                onClick={() => handleSelectPattern(pattern)}
              >
                <div>
                  <div className="font-medium">{pattern.name}</div>
                  {pattern.description && (
                    <div className="text-xs opacity-80 mt-0.5">{pattern.description}</div>
                  )}
                </div>
              </Button>
            ))}
          </div>
          
          {/* Breathing animation - only show when a voice is active */}
          {selectedPattern && showAnimation && (
            <div className="mt-8">
              <BreathingAnimation 
                technique={selectedPattern.id === "1" ? "4-7-8" : selectedPattern.id === "2" ? "box-breathing" : "diaphragmatic"}
                voiceUrls={activeVoice === "vera" ? veraVoiceUrls : activeVoice === "marco" ? marcoVoiceUrls : null}
                isVoiceActive={isExerciseActive && !!activeVoice}
                currentPhase={currentPhase}
                onPhaseChange={handlePhaseChange}
              />
            </div>
          )}
          
          {/* Voice Player - always show */}
          {selectedPattern && (
            <BreathingVoicePlayer 
              veraUrls={veraVoiceUrls}
              marcoUrls={marcoVoiceUrls}
              isActive={isExerciseActive}
              onPause={handlePauseVoice}
              onPlay={handleActivateVoice}
              activeVoice={activeVoice}
              onReset={handleReset}
            />
          )}
          
          {/* Music player section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-3">Ontspannende muziek</h2>
            <BreathingMusicPlayer />
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Breathing;
