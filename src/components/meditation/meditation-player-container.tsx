
import React, { useState, useEffect, useRef } from "react";
import { AudioPlayer } from "@/components/audio-player";
import { Meditation } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Equalizer } from "@/components/music/equalizer";

interface MeditationPlayerContainerProps {
  isVisible: boolean;
  selectedMeditation: Meditation | null;
}

export function MeditationPlayerContainer({ 
  isVisible, 
  selectedMeditation 
}: MeditationPlayerContainerProps) {
  const [audioError, setAudioError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (selectedMeditation) {
      // Reset errors when meditation changes
      setAudioError(false);
      setImageError(false);
      setIsPlaying(true); // Auto-play when meditation changes
      
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
    setIsPlaying(false);
    toast.error("Kon de audio niet laden. Controleer de URL.");
  };
  
  const handleImageError = () => {
    setImageError(true);
    toast.error("Kon de afbeelding niet laden. Controleer de URL.");
  };

  const handleAudioElementRef = (element: HTMLAudioElement | null) => {
    // Only update the ref if it's a different element or null
    if (element !== audioRef.current) {
      audioRef.current = element;
    }
  };

  if (!hasValidAudio || audioError) {
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
    <div className="mt-4 space-y-4">
      {hasValidImage && !imageError && (
        <div className="mb-4">
          <img 
            src={selectedMeditation.coverImageUrl}
            alt={selectedMeditation.title}
            className="w-full h-48 object-cover rounded-lg shadow-md"
            onError={handleImageError}
          />
        </div>
      )}
      
      {imageError && (
        <Alert className="mb-4" variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Kon de afbeelding niet laden. De meditatie is nog steeds beschikbaar.
          </AlertDescription>
        </Alert>
      )}
      
      <Equalizer 
        isActive={isPlaying} 
        className="mb-2" 
        audioElement={audioRef.current} 
      />
      
      <AudioPlayer 
        audioUrl={selectedMeditation.audioUrl}
        title={selectedMeditation.title}
        showTitle
        showControls
        className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg shadow-sm"
        onError={handleAudioError}
        isPlayingExternal={isPlaying}
        onPlayPauseChange={setIsPlaying}
        onAudioElementRef={handleAudioElementRef}
      />
    </div>
  );
}
