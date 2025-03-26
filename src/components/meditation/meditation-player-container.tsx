
import React, { useState, useEffect, useRef } from "react";
import { AudioPlayer } from "@/components/audio-player";
import { Meditation } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, StopCircle, PlayCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  const [playerKey, setPlayerKey] = useState(0); // Add key to force remounting
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    if (selectedMeditation) {
      // Reset errors when meditation changes
      setAudioError(false);
      setImageError(false);
      setIsPlaying(false); // Don't auto-play initially, let user click play
      
      // Force AudioPlayer to remount when meditation changes
      setPlayerKey(prevKey => prevKey + 1);
      
      // Log the meditation details for debugging
      console.log("Selected meditation:", selectedMeditation);
      console.log("Audio URL:", selectedMeditation.audioUrl);
      console.log("Marco link:", selectedMeditation.marcoLink);
      console.log("Vera link:", selectedMeditation.veraLink);
      
      // Short timeout before allowing play
      setTimeout(() => {
        setIsPlaying(true); // Now enable auto-play
      }, 500);
    }
  }, [selectedMeditation]);
  
  if (!isVisible || !selectedMeditation) {
    return null;
  }
  
  // Check if the audioUrl exists and is valid, use more permissive checking
  const hasValidAudio = !!selectedMeditation.audioUrl || 
                        !!selectedMeditation.veraLink || 
                        !!selectedMeditation.marcoLink;
  
  // Check if the coverImageUrl exists and is valid
  const hasValidImage = !!selectedMeditation.coverImageUrl;
  
  const handleAudioError = () => {
    setAudioError(true);
    setIsPlaying(false);
    console.error("Audio error for:", selectedMeditation.audioUrl);
    toast.error("Kon de audio niet laden. Controleer de URL.");
  };
  
  const handleImageError = () => {
    setImageError(true);
    toast.error("Kon de afbeelding niet laden. Controleer de URL.");
  };

  const handleStopPlaying = () => {
    setIsPlaying(false);
    toast("De meditatie is gestopt met afspelen", {
      description: "Gestopt"
    });
  };
  
  const handleStartPlaying = () => {
    setIsPlaying(true);
    toast("De meditatie wordt afgespeeld", {
      description: "Start"
    });
  };

  // Handle external link navigation
  const handleExternalLink = (linkType: 'vera' | 'marco') => {
    const url = linkType === 'vera' 
      ? selectedMeditation.veraLink 
      : selectedMeditation.marcoLink;
    
    if (!url) {
      toast.error(`Geen ${linkType === 'vera' ? 'Vera' : 'Marco'} link beschikbaar voor deze meditatie`);
      return;
    }
    
    // Open in new tab
    window.open(url, '_blank');
    toast.success(`${linkType === 'vera' ? 'Vera' : 'Marco'} link geopend in nieuw tabblad`);
  };

  if (!hasValidAudio || audioError) {
    return (
      <div className="mt-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Geen audio beschikbaar voor deze meditatie. Probeer een andere meditatie te selecteren.
            {selectedMeditation.audioUrl && (
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setAudioError(false);
                    handleStartPlaying();
                  }}
                >
                  Probeer opnieuw
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Nu speelt: {selectedMeditation.title}</h3>
        {isPlaying ? (
          <Button 
            variant="destructive"
            size="sm"
            onClick={handleStopPlaying}
            className="flex items-center gap-1"
          >
            <StopCircle className="h-4 w-4" />
            Stoppen
          </Button>
        ) : (
          <Button 
            variant="default"
            size="sm"
            onClick={handleStartPlaying}
            className="flex items-center gap-1"
          >
            <PlayCircle className="h-4 w-4" />
            Start
          </Button>
        )}
      </div>

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
        key={playerKey} // Force remount when meditation changes
        audioUrl={selectedMeditation.audioUrl || ''}
        title={selectedMeditation.title}
        showTitle
        showControls
        className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg shadow-sm"
        onError={handleAudioError}
        isPlayingExternal={isPlaying}
        onPlayPauseChange={setIsPlaying}
        ref={audioRef}
      />
      
      {/* External links buttons for Vera and Marco */}
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          className={`flex-1 ${selectedMeditation.veraLink ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'opacity-50'}`}
          onClick={() => handleExternalLink('vera')}
          disabled={!selectedMeditation.veraLink}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Vera
        </Button>
        
        <Button
          variant="outline"
          className={`flex-1 ${selectedMeditation.marcoLink ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'opacity-50'}`}
          onClick={() => handleExternalLink('marco')}
          disabled={!selectedMeditation.marcoLink}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Marco
        </Button>
      </div>
    </div>
  );
}
