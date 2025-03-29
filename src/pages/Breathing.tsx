
import React, { useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { useBreathingExercise } from "@/hooks/breathing-exercise";
import { useBreathingMusic } from "@/hooks/use-breathing-music";
import { BreathingPageContent } from "@/components/breathing-page/breathing-page-content";

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

  // Sync music tracks from useBreathingMusic to useBreathingExercise
  useEffect(() => {
    setMusicTracks(musicTracks);
  }, [musicTracks, setMusicTracks]);

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
