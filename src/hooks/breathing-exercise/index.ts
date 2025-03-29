
import { useBreathingPatterns } from "./use-breathing-patterns";
import { useExerciseState } from "./use-exercise-state";
import { useVoiceConfig } from "./use-voice-config";
import { useAudioControl } from "./use-audio-control";
import { useState } from "react";
import { Soundscape } from "@/lib/types";
import { toast } from "sonner";

export function useBreathingExercise() {
  // Get pattern state
  const {
    breathingPatterns,
    selectedPattern,
    handleSelectPattern
  } = useBreathingPatterns();

  // Get exercise state
  const {
    isExerciseActive,
    activeVoice,
    currentPhase,
    showAnimation,
    currentCycle,
    exerciseCompleted,
    startAudioRef,
    endAudioRef,
    setIsExerciseActive,
    setActiveVoice,
    setCurrentPhase,
    setShowAnimation,
    setCurrentCycle,
    setExerciseCompleted,
    handlePhaseChange,
    handleExerciseComplete
  } = useExerciseState(selectedPattern);

  // Get voice config
  const {
    veraVoiceUrls,
    marcoVoiceUrls,
    voiceVolume,
    handleVoiceVolumeChange
  } = useVoiceConfig();

  // Get audio control
  const {
    musicVolume,
    onActivateVoice,
    handlePauseVoice,
    handleMusicVolumeChange
  } = useAudioControl({
    selectedPattern,
    veraVoiceUrls,
    marcoVoiceUrls,
    startAudioRef,
    setActiveVoice,
    setIsExerciseActive,
    setCurrentPhase,
    setShowAnimation,
    setCurrentCycle,
    setExerciseCompleted
  });

  // Music state
  const [musicTracks, setMusicTracks] = useState<Soundscape[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Soundscape | null>(null);
  const [isTrackPlaying, setIsTrackPlaying] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

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

  // Apply volume effect on audioPlayerRef
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.volume = musicVolume;
    }
  }, [musicVolume, audioPlayerRef]);

  // Apply volume effect on start and end audio refs
  useEffect(() => {
    if (startAudioRef.current) {
      startAudioRef.current.volume = voiceVolume;
    }
    if (endAudioRef.current) {
      endAudioRef.current.volume = voiceVolume;
    }
  }, [voiceVolume, startAudioRef, endAudioRef]);

  return {
    // State
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
    musicTracks,
    currentTrack,
    isTrackPlaying,
    
    // Refs
    startAudioRef,
    endAudioRef,
    audioPlayerRef,
    
    // Handlers
    setMusicTracks,
    handleSelectPattern,
    onActivateVoice,
    handlePauseVoice,
    handlePhaseChange,
    handleVoiceVolumeChange,
    handleMusicVolumeChange,
    handlePlayTrack,
    setIsTrackPlaying
  };
}

// Import missing ref
import { useRef, useEffect } from 'react';
