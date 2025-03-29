
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { BreathingPhase } from "@/components/breathing/types";
import { Soundscape } from "@/lib/types";
import { BreathingPattern, VoiceURLs } from "../types/breathing-page-types";
import { defaultBreathingPatterns, defaultVoiceUrls, validateAudioFiles } from "../utils/breathing-page-utils";

export const useBreathingPageState = () => {
  const [pageKey, setPageKey] = useState(Date.now());
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

  // Reset all states and clear caches
  const clearCaches = () => {
    localStorage.removeItem('breathing_cache_timestamp');
    
    setIsExerciseActive(false);
    setActiveVoice(null);
    setCurrentPhase("start");
    setShowAnimation(true);
    setCurrentCycle(1);
    setExerciseCompleted(false);
    
    loadVoiceUrls();
  };

  // Force page reload by resetting the key
  const forcePageReload = () => {
    setPageKey(Date.now());
    clearCaches();
    toast.success("Pagina opnieuw geladen", {
      description: "Alle componenten zijn ververst"
    });
  };

  // Load voice URLs from localStorage
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

  return {
    // State
    pageKey,
    breathingPatterns,
    setBreathingPatterns,
    selectedPattern,
    setSelectedPattern,
    isExerciseActive,
    setIsExerciseActive,
    activeVoice,
    setActiveVoice,
    currentPhase,
    setCurrentPhase,
    showAnimation,
    setShowAnimation,
    currentCycle,
    setCurrentCycle,
    exerciseCompleted,
    setExerciseCompleted,
    startAudioRef,
    endAudioRef,
    activeTab,
    setActiveTab,
    veraVoiceUrls,
    setVeraVoiceUrls,
    marcoVoiceUrls,
    setMarcoVoiceUrls,
    voiceUrlsValidated,
    setVoiceUrlsValidated,
    voiceVolume,
    setVoiceVolume,
    musicVolume,
    setMusicVolume,
    soundscapes,
    musicTracks,
    setMusicTracks,
    currentTrack,
    setCurrentTrack,
    isTrackPlaying,
    setIsTrackPlaying,
    audioPlayerRef,

    // Methods
    forcePageReload,
    clearCaches,
    loadVoiceUrls
  };
};
