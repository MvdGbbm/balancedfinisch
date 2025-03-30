
import React from "react";
import { BreathingVolumeControls } from "@/components/breathing/breathing-volume-controls";

interface BreathingVolumeSectionProps {
  voiceVolume: number;
  musicVolume: number;
  onVoiceVolumeChange: (volume: number) => void;
  onMusicVolumeChange: (volume: number) => void;
}

export const BreathingVolumeSection: React.FC<BreathingVolumeSectionProps> = ({
  voiceVolume,
  musicVolume,
  onVoiceVolumeChange,
  onMusicVolumeChange
}) => {
  return (
    <BreathingVolumeControls 
      voiceVolume={voiceVolume}
      musicVolume={musicVolume}
      onVoiceVolumeChange={onVoiceVolumeChange}
      onMusicVolumeChange={onMusicVolumeChange}
      className="mt-4"
    />
  );
};
