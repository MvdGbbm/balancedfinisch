
import React, { useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import BreathingAnimation from "@/components/breathing/breathing-animation";
import { BreathingVoicePlayer } from "@/components/breathing/breathing-voice-player";
import { BreathingVolumeControls } from "@/components/breathing/breathing-volume-controls";
import { useBreathingPageState } from "@/components/breathing/hooks/use-breathing-page-state";
import { useBreathingPageHandlers } from "@/components/breathing/hooks/use-breathing-page-handlers";
import { handleVisibilityChange } from "@/components/breathing/utils/breathing-page-utils";
import { PatternSelector } from "@/components/breathing/page/pattern-selector";
import { MusicPlayer } from "@/components/breathing/page/music-player";
import { PageHeader } from "@/components/breathing/page/page-header";

const Breathing = () => {
  const state = useBreathingPageState();
  const handlers = useBreathingPageHandlers({
    selectedPattern: state.selectedPattern,
    setSelectedPattern: state.setSelectedPattern,
    isExerciseActive: state.isExerciseActive,
    setIsExerciseActive: state.setIsExerciseActive,
    activeVoice: state.activeVoice,
    setActiveVoice: state.setActiveVoice,
    currentPhase: state.currentPhase,
    setCurrentPhase: state.setCurrentPhase,
    setShowAnimation: state.setShowAnimation,
    currentCycle: state.currentCycle,
    setCurrentCycle: state.setCurrentCycle,
    setExerciseCompleted: state.setExerciseCompleted,
    startAudioRef: state.startAudioRef,
    endAudioRef: state.endAudioRef,
    breathingPatterns: state.breathingPatterns,
    veraVoiceUrls: state.veraVoiceUrls,
    marcoVoiceUrls: state.marcoVoiceUrls,
    voiceVolume: state.voiceVolume,
    musicVolume: state.musicVolume,
    setVoiceVolume: state.setVoiceVolume,
    setMusicVolume: state.setMusicVolume,
    audioPlayerRef: state.audioPlayerRef,
    currentTrack: state.currentTrack,
    setCurrentTrack: state.setCurrentTrack,
    isTrackPlaying: state.isTrackPlaying,
    setIsTrackPlaying: state.setIsTrackPlaying
  });

  useEffect(() => {
    localStorage.setItem('breathing_cache_timestamp', Date.now().toString());
    
    const savedPatterns = localStorage.getItem('breathingPatterns');
    if (savedPatterns) {
      try {
        const parsedPatterns = JSON.parse(savedPatterns);
        state.setBreathingPatterns(parsedPatterns);
        if (parsedPatterns.length > 0) {
          state.setSelectedPattern(parsedPatterns[0]);
        }
      } catch (error) {
        console.error("Error loading breathing patterns:", error);
        state.setSelectedPattern(state.breathingPatterns[0]);
      }
    } else {
      state.setSelectedPattern(state.breathingPatterns[0]);
    }
    
    state.loadVoiceUrls();
    
    const visibilityChangeHandler = () => {
      const lastTimestamp = parseInt(localStorage.getItem('breathing_cache_timestamp') || '0');
      handleVisibilityChange(lastTimestamp, state.forcePageReload);
    };
    
    document.addEventListener("visibilitychange", visibilityChangeHandler);
    
    return () => {
      document.removeEventListener("visibilitychange", visibilityChangeHandler);
    };
  }, []);

  // Set music tracks from context
  useEffect(() => {
    if (state.soundscapes) {
      state.setMusicTracks(state.soundscapes);
    }
  }, [state.soundscapes]);

  const voicePlayerHeaderText = "Kies een stem voor begeleiding";

  return (
    <MobileLayout>
      <div key={state.pageKey} className="container py-6 animate-fade-in">
        <PageHeader onRefresh={state.forcePageReload} />
        
        <div className="space-y-6">
          <PatternSelector 
            patterns={state.breathingPatterns}
            selectedPattern={state.selectedPattern}
            onSelectPattern={handlers.handleSelectPattern}
            disabled={state.isExerciseActive}
          />
          
          {state.selectedPattern && state.showAnimation && (
            <div className="mt-8">
              <BreathingAnimation 
                technique={state.selectedPattern.id === "1" ? "4-7-8" : state.selectedPattern.id === "2" ? "box-breathing" : "diaphragmatic"}
                voiceUrls={state.activeVoice === "vera" ? state.veraVoiceUrls : state.activeVoice === "marco" ? state.marcoVoiceUrls : null}
                isVoiceActive={state.isExerciseActive && !!state.activeVoice}
                currentPhase={state.currentPhase}
                onPhaseChange={handlers.handlePhaseChange}
                currentCycle={state.currentCycle}
                totalCycles={state.selectedPattern.cycles}
                exerciseCompleted={state.exerciseCompleted}
                inhaleTime={state.selectedPattern.inhale}
                holdTime={state.selectedPattern.hold1}
                exhaleTime={state.selectedPattern.exhale}
                pauseTime={state.selectedPattern.hold2}
              />
            </div>
          )}
          
          <audio ref={state.startAudioRef} style={{ display: 'none' }} />
          <audio ref={state.endAudioRef} style={{ display: 'none' }} />
          
          {state.selectedPattern && (
            <BreathingVoicePlayer 
              veraUrls={state.veraVoiceUrls}
              marcoUrls={state.marcoVoiceUrls}
              isActive={state.isExerciseActive}
              onPause={handlers.handlePauseVoice}
              onPlay={handlers.handleActivateVoice}
              activeVoice={state.activeVoice}
              headerText={voicePlayerHeaderText}
            />
          )}
          
          <BreathingVolumeControls 
            voiceVolume={state.voiceVolume}
            musicVolume={state.musicVolume}
            onVoiceVolumeChange={handlers.handleVoiceVolumeChange}
            onMusicVolumeChange={handlers.handleMusicVolumeChange}
            className="mt-4"
          />
          
          <MusicPlayer 
            musicTracks={state.musicTracks}
            currentTrack={state.currentTrack}
            isTrackPlaying={state.isTrackPlaying}
            musicVolume={state.musicVolume}
            audioPlayerRef={state.audioPlayerRef}
            onPlayTrack={handlers.handlePlayTrack}
            onPlayPauseChange={state.setIsTrackPlaying}
          />
        </div>
      </div>
    </MobileLayout>
  );
};

export default Breathing;
