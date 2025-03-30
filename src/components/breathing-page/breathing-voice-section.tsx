
import React from "react";
import { BreathingVoicePlayer } from "@/components/breathing/breathing-voice-player";
import { VoiceURLs } from "@/components/breathing-page/types";

interface BreathingVoiceSectionProps {
  veraVoiceUrls: VoiceURLs;
  marcoVoiceUrls: VoiceURLs;
  isActive: boolean;
  onPause: () => void;
  onPlay: (voice: "vera" | "marco") => void;
  activeVoice: "vera" | "marco" | null;
}

export const BreathingVoiceSection: React.FC<BreathingVoiceSectionProps> = ({
  veraVoiceUrls,
  marcoVoiceUrls,
  isActive,
  onPause,
  onPlay,
  activeVoice
}) => {
  const headerText = "Kies een stem voor begeleiding";

  return (
    <BreathingVoicePlayer 
      veraUrls={veraVoiceUrls}
      marcoUrls={marcoVoiceUrls}
      isActive={isActive}
      onPause={onPause}
      onPlay={onPlay}
      activeVoice={activeVoice}
      headerText={headerText}
    />
  );
};
