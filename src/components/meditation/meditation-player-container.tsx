
import React, { useState, useEffect } from "react";
import { AudioPlayer } from "@/components/audio-player";
import { Meditation } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Radio } from "lucide-react";
import { toast } from "sonner";

interface MeditationPlayerContainerProps {
  isVisible: boolean;
  selectedMeditation: Meditation | null;
  isStreamMode?: boolean;
}

export function MeditationPlayerContainer({ 
  isVisible, 
  selectedMeditation,
  isStreamMode = false 
}: MeditationPlayerContainerProps) {
  const [audioError, setAudioError] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    if (selectedMeditation) {
      // Reset errors when meditation changes
      setAudioError(false);
      setImageError(false);
      
      // Log the meditation details for debugging
      console.log("Selected meditation:", selectedMeditation);
    }
  }, [selectedMeditation]);
  
  if (!isVisible || !selectedMeditation) {
    return null;
  }
  
  // Check if the audioUrl exists and is valid
  const hasValidAudio = selectedMeditation.audioUrl && 
    (selectedMeditation.audioUrl.startsWith('http') || 
    selectedMeditation.audioUrl.startsWith('/'));
  
  // Check if the coverImageUrl exists and is valid
  const hasValidImage = selectedMeditation.coverImageUrl && 
    (selectedMeditation.coverImageUrl.startsWith('http') || 
    selectedMeditation.coverImageUrl.startsWith('/'));
  
  const handleAudioError = () => {
    setAudioError(true);
    toast.error("Kon de audio niet laden. Controleer de URL.");
  };
  
  const handleImageError = () => {
    setImageError(true);
    toast.error("Kon de afbeelding niet laden. Controleer de URL.");
  };

  if (!hasValidAudio || audioError) {
    return (
      <div className="mt-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Geen audio beschikbaar voor deze {isStreamMode ? "stream" : "meditatie"}. Probeer een andere {isStreamMode ? "stream" : "meditatie"} te selecteren.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {hasValidImage && !imageError && (
        <div className="mb-4">
          <img 
            src={selectedMeditation.coverImageUrl}
            alt={selectedMeditation.title}
            className="w-full h-48 object-cover rounded-lg"
            onError={handleImageError}
          />
        </div>
      )}
      
      {imageError && (
        <Alert className="mb-4" variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Kon de afbeelding niet laden. De {isStreamMode ? "stream" : "meditatie"} is nog steeds beschikbaar.
          </AlertDescription>
        </Alert>
      )}
      
      <AudioPlayer 
        audioUrl={selectedMeditation.audioUrl}
        title={selectedMeditation.title}
        showTitle
        showControls
        isStream={isStreamMode}
        className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg shadow-sm"
        onError={handleAudioError}
      />
    </div>
  );
}
