
import { toast } from "sonner";
import { BreathingPhase } from "@/components/breathing/types";
import { BreathingPattern, VoiceURLs } from "../types/breathing-page-types";
import { validateAudioFiles } from "../utils/breathing-page-utils";
import { Soundscape } from "@/lib/types";

interface BreathingPageHandlersProps {
  selectedPattern: BreathingPattern | null;
  setSelectedPattern: (pattern: BreathingPattern | null) => void;
  isExerciseActive: boolean;
  setIsExerciseActive: (active: boolean) => void;
  activeVoice: "vera" | "marco" | null;
  setActiveVoice: (voice: "vera" | "marco" | null) => void;
  currentPhase: BreathingPhase;
  setCurrentPhase: (phase: BreathingPhase) => void;
  setShowAnimation: (show: boolean) => void;
  currentCycle: number; 
  setCurrentCycle: (cycle: number) => void;
  setExerciseCompleted: (completed: boolean) => void;
  startAudioRef: React.RefObject<HTMLAudioElement>;
  endAudioRef: React.RefObject<HTMLAudioElement>;
  breathingPatterns: BreathingPattern[];
  veraVoiceUrls: VoiceURLs;
  marcoVoiceUrls: VoiceURLs;
  voiceVolume: number;
  musicVolume: number;
  setVoiceVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  audioPlayerRef: React.RefObject<HTMLAudioElement>;
  currentTrack: Soundscape | null;
  setCurrentTrack: (track: Soundscape | null) => void;
  isTrackPlaying: boolean;
  setIsTrackPlaying: (playing: boolean) => void;
}

export const useBreathingPageHandlers = ({
  selectedPattern,
  setSelectedPattern,
  isExerciseActive,
  setIsExerciseActive,
  activeVoice,
  setActiveVoice,
  currentPhase,
  setCurrentPhase,
  setShowAnimation,
  currentCycle,
  setCurrentCycle,
  setExerciseCompleted,
  startAudioRef,
  endAudioRef,
  breathingPatterns,
  veraVoiceUrls,
  marcoVoiceUrls,
  voiceVolume,
  musicVolume,
  setVoiceVolume,
  setMusicVolume,
  audioPlayerRef,
  currentTrack,
  setCurrentTrack,
  isTrackPlaying,
  setIsTrackPlaying
}: BreathingPageHandlersProps) => {
  
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

  return {
    handleSelectPattern,
    handleActivateVoice,
    handlePauseVoice,
    handlePhaseChange,
    handleVoiceVolumeChange,
    handleMusicVolumeChange,
    handlePlayTrack
  };
};
