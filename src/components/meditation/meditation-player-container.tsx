
import React from "react";
import { AudioPlayer } from "@/components/audio-player";
import { Meditation } from "@/lib/types";

interface MeditationPlayerContainerProps {
  isVisible: boolean;
  selectedMeditation: Meditation | null;
}

export function MeditationPlayerContainer({ 
  isVisible, 
  selectedMeditation 
}: MeditationPlayerContainerProps) {
  if (!isVisible || !selectedMeditation) {
    return null;
  }

  return (
    <div className="mt-4">
      <AudioPlayer 
        audioUrl={selectedMeditation.audioUrl}
        title={selectedMeditation.title}
        showTitle
        showControls
        className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg shadow-sm"
      />
    </div>
  );
}
