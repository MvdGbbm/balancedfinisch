
import React, { useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { useBreathingExercise } from "@/hooks/use-breathing-exercise";
import { useBreathingMusic } from "@/hooks/use-breathing-music";
import { BreathingPageContent } from "@/components/breathing-page/breathing-page-content";
import { toast } from "sonner";

const Breathing = () => {
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
    voiceVolume,
    musicVolume,
    startAudioRef,
    endAudioRef,
    handleSelectPattern,
    onActivateVoice,
    handlePauseVoice,
    handlePhaseChange,
    handleVoiceVolumeChange,
    handleMusicVolumeChange,
    setMusicTracks
  } = useBreathingExercise();

  const {
    musicTracks,
    currentTrack,
    isTrackPlaying,
    audioPlayerRef,
    handlePlayTrack,
    setIsTrackPlaying
  } = useBreathingMusic();

  // Debug component mounting
  useEffect(() => {
    console.log("Breathing page mounted");
    console.log("Initial breathing patterns:", breathingPatterns);
    console.log("Initial music tracks:", musicTracks);
    
    // Show toast if needed components aren't properly initialized
    if (!breathingPatterns || breathingPatterns.length === 0) {
      toast.warning("Geen ademhalingspatronen gevonden");
    }
    
    if (!musicTracks || musicTracks.length === 0) {
      console.log("No music tracks found");
    }
  }, []);

  // Sync music tracks from useBreathingMusic to useBreathingExercise
  useEffect(() => {
    if (musicTracks && musicTracks.length > 0) {
      console.log("Syncing music tracks:", musicTracks);
      setMusicTracks(musicTracks);
    }
  }, [musicTracks, setMusicTracks]);

  // Debug voice state
  useEffect(() => {
    if (activeVoice) {
      console.log(`Active voice: ${activeVoice}`);
      console.log(`Vera URLs:`, veraVoiceUrls);
      console.log(`Marco URLs:`, marcoVoiceUrls);
    }
  }, [activeVoice, veraVoiceUrls, marcoVoiceUrls]);

  return (
    <MobileLayout>
      <BreathingPageContent
        breathingPatterns={breathingPatterns}
        selectedPattern={selectedPattern}
        isExerciseActive={isExerciseActive}
        showAnimation={showAnimation}
        currentCycle={currentCycle}
        exerciseCompleted={exerciseCompleted}
        currentPhase={currentPhase}
        veraVoiceUrls={veraVoiceUrls}
        marcoVoiceUrls={marcoVoiceUrls}
        startAudioRef={startAudioRef}
        endAudioRef={endAudioRef}
        voiceVolume={voiceVolume}
        musicVolume={musicVolume}
        musicTracks={musicTracks}
        currentTrack={currentTrack}
        isTrackPlaying={isTrackPlaying}
        audioPlayerRef={audioPlayerRef}
        activeVoice={activeVoice}
        
        onSelectPattern={handleSelectPattern}
        onPhaseChange={handlePhaseChange}
        onPause={handlePauseVoice}
        onActivateVoice={onActivateVoice}
        onVoiceVolumeChange={handleVoiceVolumeChange}
        onMusicVolumeChange={handleMusicVolumeChange}
        onPlayTrack={handlePlayTrack}
        onTrackPlayPauseChange={setIsTrackPlaying}
      />
    </MobileLayout>
  );
};

export default Breathing;
