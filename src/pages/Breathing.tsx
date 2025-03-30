
import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import BreathingPatternSelector from "@/components/breathing/breathing-pattern-selector";
import BreathingExerciseAnimation from "@/components/breathing/breathing-exercise-animation";
import BreathingControls from "@/components/breathing/breathing-controls";
import BreathingMusicSelector from "@/components/breathing/breathing-music-selector";
import { useBreathingSession } from "@/hooks/use-breathing-session";
import { useBreathingAudio } from "@/hooks/use-breathing-audio";
import { Soundscape } from "@/lib/types";

const Breathing = () => {
  const { soundscapes } = useApp();
  
  // Core breathing session state
  const {
    breathingPatterns,
    selectedPattern,
    isExerciseActive,
    activeVoice,
    currentPhase,
    showAnimation,
    currentCycle,
    exerciseCompleted,
    veraVoiceUrls,
    marcoVoiceUrls,
    voiceUrlsValidated,
    voiceVolume,
    musicVolume,
    handleSelectPattern,
    handleActivateVoice,
    handlePauseVoice,
    handlePhaseChange,
    handleVoiceVolumeChange,
    handleMusicVolumeChange
  } = useBreathingSession();
  
  // Audio references and handlers
  const {
    startAudioRef,
    endAudioRef,
    musicTracks,
    currentTrack,
    isTrackPlaying,
    audioPlayerRef,
    handlePlayTrack
  } = useBreathingAudio({ soundscapes, musicVolume });

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
            headerText="Kies een stem voor begeleiding"
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
            onPlayPauseChange={isPlaying => {}}
            audioPlayerRef={audioPlayerRef}
          />
        </div>
      </div>
    </MobileLayout>
  );
};

export default Breathing;
