
import React, { useState, useEffect, useRef } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { toast } from "sonner";
import { validateAudioUrl, preloadAudio } from "@/components/audio-player/utils";
import { BreathingPhase } from "@/components/breathing/types";
import { useApp } from "@/context/AppContext";
import BreathingPatternSelector from "@/components/breathing/breathing-pattern-selector";
import BreathingExerciseAnimation from "@/components/breathing/breathing-exercise-animation";
import BreathingControls from "@/components/breathing/breathing-controls";
import BreathingMusicSelector from "@/components/breathing/breathing-music-selector";
import { Soundscape } from "@/lib/types";

type BreathingPattern = {
  id: string;
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number;
  description?: string;
  startUrl?: string;
  endUrl?: string;
};

type VoiceURLs = {
  start?: string;
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
    startUrl: "",
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
    startUrl: "",
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
    startUrl: "",
  },
];

const defaultVoiceUrls: Record<string, VoiceURLs> = {
  vera: {
    start: "",
    inhale: "",
    hold: "",
    exhale: "",
  },
  marco: {
    start: "",
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
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>("start");
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const startAudioRef = useRef<HTMLAudioElement | null>(null);
  const endAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const [veraVoiceUrls, setVeraVoiceUrls] = useState<VoiceURLs>(defaultVoiceUrls.vera);
  const [marcoVoiceUrls, setMarcoVoiceUrls] = useState<VoiceURLs>(defaultVoiceUrls.marco);
  const [voiceUrlsValidated, setVoiceUrlsValidated] = useState<boolean>(false);
  
  const [voiceVolume, setVoiceVolume] = useState<number>(0.8);
  const [musicVolume, setMusicVolume] = useState<number>(0.5);

  const { soundscapes } = useApp();
  const [musicTracks, setMusicTracks] = useState<Soundscape[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Soundscape | null>(null);
  const [isTrackPlaying, setIsTrackPlaying] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

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

  useEffect(() => {
    const filteredTracks = soundscapes.filter(
      soundscape => soundscape.category === "Muziek"
    );
    setMusicTracks(filteredTracks);
  }, [soundscapes]);

  const loadVoiceUrls = async () => {
    const savedVeraUrls = localStorage.getItem('veraVoiceUrls');
    if (savedVeraUrls) {
      try {
        const parsedUrls = JSON.parse(savedVeraUrls);
        
        const validatedUrls = {
          start: parsedUrls.start ? validateAudioUrl(parsedUrls.start) : "",
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
          start: parsedUrls.start ? validateAudioUrl(parsedUrls.start) : "",
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
    const urlsToValidate = [urls.inhale, urls.hold, urls.exhale].filter(Boolean);
    
    if (urls.start) {
      urlsToValidate.push(urls.start);
    }
    
    if (urlsToValidate.length === 0) {
      console.log(`${voice} URLs are not complete, skipping validation`);
      return false;
    }
    
    console.log(`Validating ${voice} audio URLs...`);
    
    try {
      const validationPromises = urlsToValidate.map(url => preloadAudio(url));
      const validationResults = await Promise.all(validationPromises);
      
      const allValid = validationResults.every(result => result === true);
      
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
      setCurrentPhase("start");
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
    
    if (selectedPattern?.startUrl && startAudioRef.current) {
      startAudioRef.current.src = selectedPattern.startUrl;
      startAudioRef.current.load();
      
      try {
        await startAudioRef.current.play();
        console.log("Playing start audio:", selectedPattern.startUrl);
      } catch (error) {
        console.error("Error playing start audio:", error);
      }
    }
    
    setActiveVoice(voice);
    setIsExerciseActive(true);
    setCurrentPhase("start");
    setShowAnimation(true);
    setCurrentCycle(1);
    setExerciseCompleted(false);
    console.log(`Activated ${voice} voice with URLs:`, urls);
  };

  const handlePauseVoice = () => {
    setIsExerciseActive(false);
  };

  const handlePhaseChange = (phase: BreathingPhase) => {
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

  const handleVoiceVolumeChange = (volume: number) => {
    setVoiceVolume(volume);
    if (startAudioRef.current) {
      startAudioRef.current.volume = volume;
    }
    if (endAudioRef.current) {
      endAudioRef.current.volume = volume;
    }
  };

  const handleMusicVolumeChange = (volume: number) => {
    setMusicVolume(volume);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.volume = volume;
    }
  };

  const handlePlayTrack = (track: Soundscape) => {
    if (currentTrack?.id === track.id && isTrackPlaying) {
      setIsTrackPlaying(false);
      setCurrentTrack(null);
      toast.info(`${track.title} is gestopt met afspelen`);
      return;
    }
    
    setCurrentTrack(track);
    setIsTrackPlaying(true);
    toast.success(`Nu afspelend: ${track.title}`);
  };

  const voicePlayerHeaderText = "Kies een stem voor begeleiding";

  return (
    <MobileLayout>
      <div className="container py-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-4">Ademhalingsoefeningen</h1>
        
        <div className="space-y-6">
          <BreathingPatternSelector 
            breathingPatterns={breathingPatterns}
            selectedPattern={selectedPattern}
            isExerciseActive={isExerciseActive}
            onSelectPattern={handleSelectPattern}
          />
          
          {selectedPattern && showAnimation && (
            <BreathingExerciseAnimation 
              technique={selectedPattern.id === "1" ? "4-7-8" : selectedPattern.id === "2" ? "box-breathing" : "diaphragmatic"}
              voiceUrls={activeVoice === "vera" ? veraVoiceUrls : activeVoice === "marco" ? marcoVoiceUrls : null}
              isVoiceActive={isExerciseActive && !!activeVoice}
              currentPhase={currentPhase}
              onPhaseChange={handlePhaseChange}
              currentCycle={currentCycle}
              totalCycles={selectedPattern.cycles}
              exerciseCompleted={exerciseCompleted}
              inhaleTime={selectedPattern.inhale}
              holdTime={selectedPattern.hold1}
              exhaleTime={selectedPattern.exhale}
              pauseTime={selectedPattern.hold2}
            />
          )}
          
          <BreathingControls 
            veraVoiceUrls={veraVoiceUrls}
            marcoVoiceUrls={marcoVoiceUrls}
            isExerciseActive={isExerciseActive}
            activeVoice={activeVoice}
            voiceVolume={voiceVolume}
            musicVolume={musicVolume}
            onPauseVoice={handlePauseVoice}
            onActivateVoice={handleActivateVoice}
            onVoiceVolumeChange={handleVoiceVolumeChange}
            onMusicVolumeChange={handleMusicVolumeChange}
            headerText={voicePlayerHeaderText}
            selectedPattern={selectedPattern}
            startAudioRef={startAudioRef}
            endAudioRef={endAudioRef}
          />
          
          <BreathingMusicSelector 
            musicTracks={musicTracks}
            currentTrack={currentTrack}
            isTrackPlaying={isTrackPlaying}
            musicVolume={musicVolume}
            onPlayTrack={handlePlayTrack}
            onPlayPauseChange={setIsTrackPlaying}
            audioPlayerRef={audioPlayerRef}
          />
        </div>
      </div>
    </MobileLayout>
  );
};

export default Breathing;
