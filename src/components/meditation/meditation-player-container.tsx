
import React, { useState, useEffect, useRef } from "react";
import { AudioPlayer } from "@/components/audio-player";
import { Meditation } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { checkAudioCompatibility } from "@/utils/meditation-utils";

interface MeditationPlayerContainerProps {
  isVisible: boolean;
  selectedMeditation: Meditation | null;
  hideErrorMessage?: boolean;
}

export function MeditationPlayerContainer({ 
  isVisible, 
  selectedMeditation,
  hideErrorMessage = false
}: MeditationPlayerContainerProps) {
  const [audioError, setAudioError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Reset states when meditation changes
  useEffect(() => {
    if (selectedMeditation) {
      // Reset states when meditation changes
      setAudioError(false);
      setImageError(false);
      setIsLoading(true);
      
      // Validate audio URL 
      const validateAudio = async () => {
        if (!selectedMeditation.audioUrl) {
          setAudioError(true);
          setIsLoading(false);
          return;
        }
        
        try {
          if (selectedMeditation.audioUrl.trim() === "") {
            setAudioError(true);
            setIsLoading(false);
            return;
          }
          
          const isValid = await checkAudioCompatibility(selectedMeditation.audioUrl);
          if (!isValid) {
            console.error("Audio format not supported:", selectedMeditation.audioUrl);
            setAudioError(true);
          }
        } catch (error) {
          console.error("Error checking audio:", error);
          setAudioError(true);
        } finally {
          setIsLoading(false);
        }
      };
      
      validateAudio();
      
      // Don't auto-play immediately if there was a previous error
      if (!audioError) {
        setIsPlaying(true);
      }
      
      // Log the meditation details for debugging
      console.log("Selected meditation:", selectedMeditation);
    }
  }, [selectedMeditation]);
  
  if (!isVisible || !selectedMeditation) {
    return null;
  }
  
  // Check if the audioUrl exists and is valid
  const hasValidAudio = selectedMeditation.audioUrl && 
    selectedMeditation.audioUrl.trim() !== "" &&
    (selectedMeditation.audioUrl.startsWith('http') || 
    selectedMeditation.audioUrl.startsWith('/'));
  
  // Check if the coverImageUrl exists and is valid
  const hasValidImage = selectedMeditation.coverImageUrl && 
    selectedMeditation.coverImageUrl.trim() !== "" &&
    (selectedMeditation.coverImageUrl.startsWith('http') || 
    selectedMeditation.coverImageUrl.startsWith('/'));
  
  const handleAudioError = () => {
    setAudioError(true);
    setIsPlaying(false);
    setIsLoading(false);
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
  
  const handleRetry = () => {
    setAudioError(false);
    setIsLoading(true);
    setRetryCount(prevCount => prevCount + 1);
    
    // Force reload audio by toggling isPlaying 
    setIsPlaying(false);
    setTimeout(() => {
      setIsPlaying(true);
    }, 500);
    
    toast.info("Probeer audio opnieuw te laden...");
  };

  // Show loading state
  if (isLoading && !audioError) {
    return (
      <div className="mt-4 p-4 text-center">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-primary rounded-full mb-2" 
             role="status" aria-label="loading">
          <span className="sr-only">Laden...</span>
        </div>
        <p className="text-sm text-muted-foreground">Audio laden...</p>
      </div>
    );
  }

  // Show error state with retry button
  if ((!hasValidAudio || audioError) && !hideErrorMessage) {
    return (
      <div className="mt-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Geen audio beschikbaar voor deze meditatie. Probeer een andere meditatie te selecteren of opnieuw te laden.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={handleRetry} 
          variant="outline" 
          size="sm" 
          className="mt-3 w-full"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Opnieuw proberen
        </Button>
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
            Kon de afbeelding niet laden. De meditatie is nog steeds beschikbaar.
          </AlertDescription>
        </Alert>
      )}
      
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
        hideErrorMessage={hideErrorMessage}
        key={`meditation-${selectedMeditation.id}-retry-${retryCount}`} // Force remount on retry
      />
    </div>
  );
}
