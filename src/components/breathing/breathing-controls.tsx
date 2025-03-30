
import React, { useRef } from "react";
import { BreathingVoicePlayer } from "@/components/breathing/breathing-voice-player";
import { BreathingVolumeControls } from "@/components/breathing/breathing-volume-controls";

interface BreathingControlsProps {
  veraVoiceUrls: {
    start?: string;
    inhale: string;
    hold: string;
    exhale: string;
  };
  marcoVoiceUrls: {
    start?: string;
    inhale: string;
    hold: string;
    exhale: string;
  };
  isExerciseActive: boolean;
  activeVoice: "vera" | "marco" | null;
  voiceVolume: number;
  musicVolume: number;
  onPauseVoice: () => void;
  onActivateVoice: (voice: "vera" | "marco") => void;
  onVoiceVolumeChange: (volume: number) => void;
  onMusicVolumeChange: (volume: number) => void;
  headerText?: string;
  selectedPattern: any;
  startAudioRef: React.RefObject<HTMLAudioElement>;
  endAudioRef: React.RefObject<HTMLAudioElement>;
}

const BreathingControls: React.FC<BreathingControlsProps> = ({
  veraVoiceUrls,
  marcoVoiceUrls,
  isExerciseActive,
  activeVoice,
  voiceVolume,
  musicVolume,
  onPauseVoice,
  onActivateVoice,
  onVoiceVolumeChange,
  onMusicVolumeChange,
  headerText = "Kies een stem voor begeleiding",
  selectedPattern,
  startAudioRef,
  endAudioRef,
}) => {
  return (
    <>
      <audio ref={startAudioRef} style={{ display: 'none' }} />
      <audio ref={endAudioRef} style={{ display: 'none' }} />
      
      {selectedPattern && (
        <BreathingVoicePlayer 
          veraUrls={veraVoiceUrls}
          marcoUrls={marcoVoiceUrls}
          isActive={isExerciseActive}
          onPause={onPauseVoice}
          onPlay={onActivateVoice}
          activeVoice={activeVoice}
          headerText={headerText}
        />
      )}
      
      <BreathingVolumeControls 
        voiceVolume={voiceVolume}
        musicVolume={musicVolume}
        onVoiceVolumeChange={onVoiceVolumeChange}
        onMusicVolumeChange={onMusicVolumeChange}
        className="mt-4"
      />
    </>
  );
};

export default BreathingControls;
