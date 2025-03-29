
import React from "react";
import { Soundscape } from "@/lib/types";
import { BreathingPhase } from "@/components/breathing/types";
import { BreathingPattern, VoiceURLs } from "@/components/breathing-page/types";
import { BreathingHeader } from "@/components/breathing-page/breathing-header";
import { BreathingExercise } from "@/components/breathing-page/breathing-exercise";
import { BreathingVoiceSection } from "@/components/breathing-page/breathing-voice-section";
import { BreathingVolumeSection } from "@/components/breathing-page/breathing-volume-section";
import { BreathingMusicSection } from "@/components/breathing-page/breathing-music-section";

interface BreathingPageContentProps {
  breathingPatterns: BreathingPattern[];
  selectedPattern: BreathingPattern | null;
  isExerciseActive: boolean;
  showAnimation: boolean;
  currentCycle: number;
  exerciseCompleted: boolean;
  currentPhase: BreathingPhase;
  veraVoiceUrls: VoiceURLs;
  marcoVoiceUrls: VoiceURLs;
  startAudioRef: React.RefObject<HTMLAudioElement>;
  endAudioRef: React.RefObject<HTMLAudioElement>;
  voiceVolume: number;
  musicVolume: number;
  musicTracks: Soundscape[];
  currentTrack: Soundscape | null;
  isTrackPlaying: boolean;
  audioPlayerRef: React.RefObject<HTMLAudioElement>;
  activeVoice: "vera" | "marco" | null;
  
  // Handlers
  onSelectPattern: (patternId: string) => void;
  onPhaseChange: (phase: BreathingPhase) => void;
  onPause: () => void;
  onActivateVoice: (voice: "vera" | "marco") => void;
  onVoiceVolumeChange: (volume: number) => void;
  onMusicVolumeChange: (volume: number) => void;
  onPlayTrack: (track: Soundscape) => void;
  onTrackPlayPauseChange: (isPlaying: boolean) => void;
}

export const BreathingPageContent: React.FC<BreathingPageContentProps> = ({
  breathingPatterns,
  selectedPattern,
  isExerciseActive,
  showAnimation,
  currentCycle,
  exerciseCompleted,
  currentPhase,
  veraVoiceUrls,
  marcoVoiceUrls,
  startAudioRef,
  endAudioRef,
  voiceVolume,
  musicVolume,
  musicTracks,
  currentTrack,
  isTrackPlaying,
  audioPlayerRef,
  activeVoice,
  
  // Handlers
  onSelectPattern,
  onPhaseChange,
  onPause,
  onActivateVoice,
  onVoiceVolumeChange,
  onMusicVolumeChange,
  onPlayTrack,
  onTrackPlayPauseChange
}) => {
  // Debug logs for audio setup
  React.useEffect(() => {
    console.log("BreathingPageContent rendered with activeVoice:", activeVoice);
    console.log("Vera voice URLs:", veraVoiceUrls);
    console.log("Marco voice URLs:", marcoVoiceUrls);
  }, [activeVoice, veraVoiceUrls, marcoVoiceUrls]);

  return (
    <div className="container py-6 animate-fade-in">
      <BreathingHeader />
      
      <div className="space-y-6">
        <BreathingExercise 
          breathingPatterns={breathingPatterns}
          selectedPattern={selectedPattern}
          isExerciseActive={isExerciseActive}
          onSelectPattern={onSelectPattern}
          showAnimation={showAnimation}
          currentCycle={currentCycle}
          exerciseCompleted={exerciseCompleted}
          currentPhase={currentPhase}
          onPhaseChange={onPhaseChange}
          veraVoiceUrls={veraVoiceUrls}
          marcoVoiceUrls={marcoVoiceUrls}
          activeVoice={activeVoice}
        />
        
        <audio ref={startAudioRef} style={{ display: 'none' }} preload="auto" />
        <audio ref={endAudioRef} style={{ display: 'none' }} preload="auto" />
        
        {selectedPattern && (
          <BreathingVoiceSection 
            veraVoiceUrls={veraVoiceUrls}
            marcoVoiceUrls={marcoVoiceUrls}
            isActive={isExerciseActive}
            onPause={onPause}
            onPlay={onActivateVoice}
            activeVoice={activeVoice}
          />
        )}
        
        <BreathingVolumeSection 
          voiceVolume={voiceVolume}
          musicVolume={musicVolume}
          onVoiceVolumeChange={onVoiceVolumeChange}
          onMusicVolumeChange={onMusicVolumeChange}
        />
        
        <BreathingMusicSection
          musicTracks={musicTracks}
          currentTrack={currentTrack}
          isTrackPlaying={isTrackPlaying}
          musicVolume={musicVolume}
          onPlayTrack={onPlayTrack}
          audioPlayerRef={audioPlayerRef}
          onTrackPlayPauseChange={onTrackPlayPauseChange}
        />
      </div>
    </div>
  );
};
