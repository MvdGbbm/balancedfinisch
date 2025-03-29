
import React from "react";
import { BreathingVoicePlayer } from "@/components/breathing/breathing-voice-player";
import { VoiceURLs } from "@/components/breathing-page/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  return (
    <Card className="border-none shadow-md bg-black/5 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Stem Begeleiding</CardTitle>
      </CardHeader>
      <CardContent>
        <BreathingVoicePlayer 
          veraUrls={veraVoiceUrls}
          marcoUrls={marcoVoiceUrls}
          isActive={isActive}
          onPause={onPause}
          onPlay={onPlay}
          activeVoice={activeVoice}
          headerText="Kies een stem voor begeleiding"
        />
      </CardContent>
    </Card>
  );
};
