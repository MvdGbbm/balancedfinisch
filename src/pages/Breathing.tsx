
import React, { useState, useEffect, useRef } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import BreathingAnimation from "@/components/breathing/breathing-animation";
import { BreathingVoicePlayer } from "@/components/breathing/breathing-voice-player";
import { toast } from "sonner";
import { validateAudioUrl, preloadAudio } from "@/components/audio-player/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BreathingPattern = {
  id: string;
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number;
  description?: string;
  endUrl?: string;
};

type VoiceURLs = {
  inhale: string;
  hold: string;
  exhale: string;
};

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
  const [currentCycle, setCurrentCycle] = useState(1);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const endAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const [veraVoiceUrls, setVeraVoiceUrls] = useState<VoiceURLs>(defaultVoiceUrls.vera);
  const [marcoVoiceUrls, setMarcoVoiceUrls] = useState<VoiceURLs>(defaultVoiceUrls.marco);
  const [voiceUrlsValidated, setVoiceUrlsValidated] = useState<boolean>(false);

  useEffect(() => {
    const savedPatterns = localStorage.getItem('breathingPatterns');
    if (savedPatterns) {
      try {
        const parsedPatterns = JSON.parse(savedPatterns);
        setBreathingPatterns(parsedPatterns);
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
    
    loadVoiceUrls();
  }, []);

  const loadVoiceUrls = async () => {
    const savedVeraUrls = localStorage.getItem('veraVoiceUrls');
    if (savedVeraUrls) {
      try {
        const parsedUrls = JSON.parse(savedVeraUrls);
        
        const validatedUrls = {
          inhale: parsedUrls.inhale ? validateAudioUrl(parsedUrls.inhale) : "",
          hold: parsedUrls.hold ? validateAudioUrl(parsedUrls.hold) : "",
          exhale: parsedUrls.exhale ? validateAudioUrl(parsedUrls.exhale) : ""
        };
        
        setVeraVoiceUrls(validatedUrls);
        console.log("Loaded Vera voice URLs:", validatedUrls);
        
        await validateAudioFiles(validatedUrls, 'vera');
      } catch (error) {
        console.error("Error loading Vera voice URLs:", error);
        setVeraVoiceUrls(defaultVoiceUrls.vera);
      }
    }
    
    const savedMarcoUrls = localStorage.getItem('marcoVoiceUrls');
    if (savedMarcoUrls) {
      try {
        const parsedUrls = JSON.parse(savedMarcoUrls);
        
        const validatedUrls = {
          inhale: parsedUrls.inhale ? validateAudioUrl(parsedUrls.inhale) : "",
          hold: parsedUrls.hold ? validateAudioUrl(parsedUrls.hold) : "",
          exhale: parsedUrls.exhale ? validateAudioUrl(parsedUrls.exhale) : ""
        };
        
        setMarcoVoiceUrls(validatedUrls);
        console.log("Loaded Marco voice URLs:", validatedUrls);
        
        await validateAudioFiles(validatedUrls, 'marco');
      } catch (error) {
        console.error("Error loading Marco voice URLs:", error);
        setMarcoVoiceUrls(defaultVoiceUrls.marco);
      }
    }
    
    setVoiceUrlsValidated(true);
  };

  const validateAudioFiles = async (urls: VoiceURLs, voice: string): Promise<boolean> => {
    if (!urls.inhale || !urls.hold || !urls.exhale) {
      console.log(`${voice} URLs are not complete, skipping validation`);
      return false;
    }
    
    console.log(`Validating ${voice} audio URLs...`);
    
    try {
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

  const handleSelectPattern = (patternId: string) => {
    const pattern = breathingPatterns.find(p => p.id === patternId);
    if (pattern) {
      setSelectedPattern(pattern);
      setIsExerciseActive(false);
      setActiveVoice(null);
      setCurrentCycle(1);
      setExerciseCompleted(false);
      
      setShowAnimation(true);
    }
  };

  const handleActivateVoice = async (voice: "vera" | "marco") => {
    const urls = voice === "vera" ? veraVoiceUrls : marcoVoiceUrls;
    
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
    setCurrentCycle(1);
    setExerciseCompleted(false);
    console.log(`Activated ${voice} voice with URLs:`, urls);
  };

  const handlePauseVoice = () => {
    setIsExerciseActive(false);
  };

  const handleReset = () => {
    setIsExerciseActive(false);
    setActiveVoice(null);
    setCurrentPhase("inhale");
    setCurrentCycle(1);
    setExerciseCompleted(false);
    
    if (endAudioRef.current) {
      endAudioRef.current.pause();
      endAudioRef.current.currentTime = 0;
    }
  };

  const handlePhaseChange = (phase: "inhale" | "hold" | "exhale" | "pause") => {
    setCurrentPhase(phase);
    
    if (phase === "inhale" && currentPhase === "pause") {
      if (selectedPattern && currentCycle < selectedPattern.cycles) {
        setCurrentCycle(prevCycle => prevCycle + 1);
      } else if (selectedPattern && currentCycle >= selectedPattern.cycles && phase === "inhale") {
        setIsExerciseActive(false);
        setExerciseCompleted(true);
        setShowAnimation(true);
        
        if (selectedPattern.endUrl) {
          try {
            if (endAudioRef.current) {
              endAudioRef.current.src = selectedPattern.endUrl;
              endAudioRef.current.load();
              endAudioRef.current.play().catch(err => {
                console.error("Error playing end audio:", err);
                toast.error("Kon audio niet afspelen");
              });
            }
          } catch (error) {
            console.error("Error with end audio:", error);
          }
        }
        
        toast.success("Ademhalingsoefening voltooid!");
      }
    }
  };

  const voicePlayerHeaderText = "Kies een stem voor begeleiding";

  return (
    <MobileLayout>
      <div className="container py-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-4">Ademhalingsoefeningen</h1>
        
        <div className="space-y-6">
          <div className="w-full">
            <Select
              value={selectedPattern?.id}
              onValueChange={handleSelectPattern}
              disabled={isExerciseActive}
            >
              <SelectTrigger className="w-full bg-tranquil-400 hover:bg-tranquil-500 text-black">
                <SelectValue placeholder="Kies" />
              </SelectTrigger>
              <SelectContent>
                {breathingPatterns.map((pattern) => (
                  <SelectItem key={pattern.id} value={pattern.id} className="py-3">
                    <div>
                      <div className="font-medium">{pattern.name}</div>
                      {pattern.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">{pattern.description}</div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedPattern && showAnimation && (
            <div className="mt-8">
              <BreathingAnimation 
                technique={selectedPattern.id === "1" ? "4-7-8" : selectedPattern.id === "2" ? "box-breathing" : "diaphragmatic"}
                voiceUrls={activeVoice === "vera" ? veraVoiceUrls : activeVoice === "marco" ? marcoVoiceUrls : null}
                isVoiceActive={isExerciseActive && !!activeVoice}
                currentPhase={currentPhase}
                onPhaseChange={handlePhaseChange}
                currentCycle={currentCycle}
                totalCycles={selectedPattern.cycles}
                exerciseCompleted={exerciseCompleted}
              />
            </div>
          )}
          
          <audio ref={endAudioRef} style={{ display: 'none' }} />
          
          {selectedPattern && (
            <BreathingVoicePlayer 
              veraUrls={veraVoiceUrls}
              marcoUrls={marcoVoiceUrls}
              isActive={isExerciseActive}
              onPause={handlePauseVoice}
              onPlay={handleActivateVoice}
              activeVoice={activeVoice}
              onReset={handleReset}
              headerText={voicePlayerHeaderText}
            />
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Breathing;
