
import React, { useState, useEffect, useRef } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import BreathingAnimation from "@/components/breathing/breathing-animation";
import { BreathingVoicePlayer } from "@/components/breathing/breathing-voice-player";
import { toast } from "sonner";
import { BreathingPhase } from "@/components/breathing/types";
import { BreathingVolumeControls } from "@/components/breathing/breathing-volume-controls";
import { useApp } from "@/context/AppContext";
import { Soundscape } from "@/lib/types";

// Import new components and utilities
import { PatternSelector } from "@/components/breathing-page/pattern-selector";
import { BreathingMusicPlayer } from "@/components/breathing-page/music-player";
import { 
  loadVoiceUrls, 
  handleActivateVoice, 
  validateAudioFiles 
} from "@/components/breathing-page/utils";
import { 
  defaultBreathingPatterns, 
  defaultVoiceUrls 
} from "@/components/breathing-page/constants";
import { 
  BreathingPattern, 
  VoiceURLs 
} from "@/components/breathing-page/types";

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
  const [activeTab, setActiveTab] = useState<"music">("music");
  
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
    
    loadVoiceUrls(setVeraVoiceUrls, setMarcoVoiceUrls, defaultVoiceUrls, setVoiceUrlsValidated);
  }, []);

  useEffect(() => {
    const filteredTracks = soundscapes.filter(
      soundscape => soundscape.category === "Muziek"
    );
    setMusicTracks(filteredTracks);
  }, [soundscapes]);

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

  const onActivateVoice = async (voice: "vera" | "marco") => {
    await handleActivateVoice(
      voice,
      veraVoiceUrls,
      marcoVoiceUrls,
      selectedPattern,
      startAudioRef,
      setActiveVoice,
      setIsExerciseActive,
      setCurrentPhase,
      setShowAnimation,
      setCurrentCycle,
      setExerciseCompleted
    );
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
          <PatternSelector 
            breathingPatterns={breathingPatterns}
            selectedPattern={selectedPattern}
            isExerciseActive={isExerciseActive}
            onSelectPattern={handleSelectPattern}
          />
          
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
                inhaleTime={selectedPattern.inhale}
                holdTime={selectedPattern.hold1}
                exhaleTime={selectedPattern.exhale}
                pauseTime={selectedPattern.hold2}
              />
            </div>
          )}
          
          <audio ref={startAudioRef} style={{ display: 'none' }} />
          <audio ref={endAudioRef} style={{ display: 'none' }} />
          
          {selectedPattern && (
            <BreathingVoicePlayer 
              veraUrls={veraVoiceUrls}
              marcoUrls={marcoVoiceUrls}
              isActive={isExerciseActive}
              onPause={handlePauseVoice}
              onPlay={onActivateVoice}
              activeVoice={activeVoice}
              headerText={voicePlayerHeaderText}
            />
          )}
          
          <BreathingVolumeControls 
            voiceVolume={voiceVolume}
            musicVolume={musicVolume}
            onVoiceVolumeChange={handleVoiceVolumeChange}
            onMusicVolumeChange={handleMusicVolumeChange}
            className="mt-4"
          />
          
          <BreathingMusicPlayer
            musicTracks={musicTracks}
            currentTrack={currentTrack}
            isTrackPlaying={isTrackPlaying}
            musicVolume={musicVolume}
            onPlayTrack={handlePlayTrack}
            audioPlayerRef={audioPlayerRef}
            onTrackPlayPauseChange={setIsTrackPlaying}
          />
        </div>
      </div>
    </MobileLayout>
  );
};

export default Breathing;
