
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
  const [playerKey, setPlayerKey] = useState(0);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    if (selectedMeditation) {
      setAudioError(false);
      setImageError(false);
      setIsPlaying(false);
      setCurrentAudioUrl(selectedMeditation.audioUrl || "");
      setPlayerKey(prevKey => prevKey + 1);
      
      console.log("Selected meditation:", selectedMeditation);
      console.log("Audio URL:", selectedMeditation.audioUrl);
      console.log("Marco link:", selectedMeditation.marcoLink);
      console.log("Vera link:", selectedMeditation.veraLink);
      
      setTimeout(() => {
        setIsPlaying(true);
      }, 500);
    }
  }, [selectedMeditation]);
  
  if (!isVisible || !selectedMeditation) {
    return null;
  }
  
  const hasValidAudio = !!selectedMeditation.audioUrl || 
                        !!selectedMeditation.veraLink || 
                        !!selectedMeditation.marcoLink;
  
  const hasValidImage = !!selectedMeditation.coverImageUrl;
  
  const handleAudioError = () => {
    setAudioError(true);
    setIsPlaying(false);
    console.error("Audio error for:", currentAudioUrl);
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

  const handlePlayExternalLink = (linkType: 'vera' | 'marco') => {
    let url = '';
    
    if (linkType === 'vera') {
      url = selectedMeditation.veraLink || '';
    } else {
      url = selectedMeditation.marcoLink || '';
    }
    
    if (!url) {
      toast.error(`Geen ${linkType === 'vera' ? 'Vera' : 'Marco'} link beschikbaar voor deze meditatie`);
      return;
    }
    
    try {
      // Trim the URL
      url = url.trim();
      
      // Check if URL has protocol, if not add https://
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      
      // Validate URL
      const validatedUrl = new URL(url).toString();
      
      // Log the validated URL for debugging
      console.log(`Playing ${linkType} link:`, validatedUrl);
      
      // Set the new audio URL for the player
      setCurrentAudioUrl(validatedUrl);
      // Force audio player to remount with new URL
      setPlayerKey(prevKey => prevKey + 1);
      // Start playing automatically
      setIsPlaying(true);
      
      toast.success(`${linkType === 'vera' ? 'Vera' : 'Marco'} audio wordt afgespeeld`);
    } catch (e) {
      console.error(`Invalid URL for ${linkType}:`, url, e);
      toast.error(`Ongeldige ${linkType === 'vera' ? 'Vera' : 'Marco'} URL: ${url}`);
    }
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
        key={playerKey}
        audioUrl={currentAudioUrl || ''}
        title={selectedMeditation.title}
        showTitle
        showControls
        className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg shadow-sm"
        onError={handleAudioError}
        isPlayingExternal={isPlaying}
        onPlayPauseChange={setIsPlaying}
        ref={audioRef}
      />
      
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          className={`flex-1 ${selectedMeditation.veraLink ? 
            (currentAudioUrl === selectedMeditation.veraLink ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'hover:bg-blue-600 hover:text-white') 
            : 'opacity-50 bg-transparent'}`}
          onClick={() => handlePlayExternalLink('vera')}
          disabled={!selectedMeditation.veraLink}
          type="button"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Vera
        </Button>
        
        <Button
          variant="outline"
          className={`flex-1 ${selectedMeditation.marcoLink ? 
            (currentAudioUrl === selectedMeditation.marcoLink ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'hover:bg-purple-600 hover:text-white') 
            : 'opacity-50 bg-transparent'}`}
          onClick={() => handlePlayExternalLink('marco')}
          disabled={!selectedMeditation.marcoLink}
          type="button"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Marco
        </Button>
      </div>
    </div>
  );
}
