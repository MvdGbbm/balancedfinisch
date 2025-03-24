
import React, { useState } from "react";
import { AudioPlayer } from "@/components/audio-player";
import { Meditation } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface MeditationPlayerContainerProps {
  isVisible: boolean;
  selectedMeditation: Meditation | null;
}

export function MeditationPlayerContainer({ 
  isVisible, 
  selectedMeditation 
}: MeditationPlayerContainerProps) {
  const [audioError, setAudioError] = useState(false);
  
  if (!isVisible || !selectedMeditation) {
    return null;
  }
  
  // Controleer of de audioUrl bestaat en geldig is
  const hasValidAudio = selectedMeditation.audioUrl && 
    (selectedMeditation.audioUrl.startsWith('http') || 
    selectedMeditation.audioUrl.startsWith('/'));
  
  if (!hasValidAudio) {
    return (
      <div className="mt-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Geen audio beschikbaar voor deze meditatie. Probeer een andere meditatie te selecteren.
          </AlertDescription>
        </Alert>
      </div>
    );
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
