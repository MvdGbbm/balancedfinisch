
import React, { useState, useEffect, useRef } from "react";
import { AudioPlayer } from "@/components/audio-player";
import { Meditation } from "@/lib/types";
import { AlertCircle, StopCircle, PlayCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QuoteDisplay } from "@/components/audio-player/quote-display";
import { getRandomQuote, validateAudioUrl, checkUrlExists } from "@/components/audio-player/utils";
import MeditationErrorDisplay from "@/components/meditation/meditation-error-display";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [randomQuote] = useState(getRandomQuote());
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    if (selectedMeditation) {
      setAudioError(false);
      setImageError(false);
      setIsPlaying(false);
      
      const loadMeditation = async () => {
        setIsLoadingAudio(true);
        
        const url = selectedMeditation.audioUrl || "";
        const validatedUrl = validateAudioUrl(url);
        
        if (validatedUrl) {
          // Check if URL is accessible
          const isAccessible = await checkUrlExists(validatedUrl);
          
          if (!isAccessible) {
            console.error("Audio URL is not accessible:", validatedUrl);
            setAudioError(true);
            setIsLoadingAudio(false);
            return;
          }
          
          setCurrentAudioUrl(validatedUrl);
          setPlayerKey(prevKey => prevKey + 1);
          
          console.log("Selected meditation:", selectedMeditation);
          console.log("Audio URL:", validatedUrl);
          console.log("Marco link:", selectedMeditation.marcoLink);
          console.log("Vera link:", selectedMeditation.veraLink);
          
          setTimeout(() => {
            setIsPlaying(true);
            setIsLoadingAudio(false);
          }, 500);
        } else {
          setAudioError(true);
          setIsLoadingAudio(false);
          console.error("Invalid audio URL:", url);
        }
      };
      
      loadMeditation();
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
  
  const handleRetryAudio = async () => {
    setIsRetrying(true);
    
    try {
      // Try the original URL first
      let urlToTry = selectedMeditation.audioUrl || '';
      let validatedUrl = validateAudioUrl(urlToTry);
      
      // If original URL isn't valid, try external links
      if (!validatedUrl) {
        if (selectedMeditation.veraLink) {
          urlToTry = selectedMeditation.veraLink;
          validatedUrl = validateAudioUrl(urlToTry);
        } else if (selectedMeditation.marcoLink) {
          urlToTry = selectedMeditation.marcoLink;
          validatedUrl = validateAudioUrl(urlToTry);
        }
      }
      
      if (validatedUrl) {
        const isAccessible = await checkUrlExists(validatedUrl);
        
        if (isAccessible) {
          setCurrentAudioUrl(validatedUrl);
          setPlayerKey(prevKey => prevKey + 1);
          setAudioError(false);
          setIsPlaying(true);
          
          toast.success("Audio succesvol hersteld");
        } else {
          toast.error("Audio URL is niet toegankelijk");
          setAudioError(true);
        }
      } else {
        toast.error("Geen geldige audio URL beschikbaar");
        setAudioError(true);
      }
    } catch (error) {
      console.error("Error retrying audio:", error);
      toast.error("Fout bij opnieuw proberen");
      setAudioError(true);
    } finally {
      setIsRetrying(false);
    }
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
      url = url.trim();
      
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      
      const validatedUrl = new URL(url).toString();
      
      console.log(`Playing ${linkType} link:`, validatedUrl);
      
      setCurrentAudioUrl(validatedUrl);
      setPlayerKey(prevKey => prevKey + 1);
      setIsPlaying(true);
      setAudioError(false);
      
      toast.success(`${linkType === 'vera' ? 'Vera' : 'Marco'} audio wordt afgespeeld`);
    } catch (e) {
      console.error(`Invalid URL for ${linkType}:`, url, e);
      toast.error(`Ongeldige ${linkType === 'vera' ? 'Vera' : 'Marco'} URL: ${url}`);
    }
  };

  if (isLoadingAudio) {
    return (
      <div className="mt-4 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!hasValidAudio || audioError) {
    return (
      <div className="mt-4">
        <MeditationErrorDisplay
          message="Geen audio beschikbaar voor deze meditatie."
          additionalDetails={
            selectedMeditation.veraLink || selectedMeditation.marcoLink 
              ? "Probeer de externe links hieronder." 
              : "Probeer een andere meditatie te selecteren."
          }
          onRetry={handleRetryAudio}
          isRetrying={isRetrying}
        />
        
        {(selectedMeditation.veraLink || selectedMeditation.marcoLink) && (
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              className={`flex-1 ${selectedMeditation.veraLink ? 'hover:bg-blue-600 hover:text-white' : 'opacity-50 bg-transparent'}`}
              onClick={() => handlePlayExternalLink('vera')}
              disabled={!selectedMeditation.veraLink}
              type="button"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Probeer Vera
            </Button>
            
            <Button
              variant="outline"
              className={`flex-1 ${selectedMeditation.marcoLink ? 'hover:bg-purple-600 hover:text-white' : 'opacity-50 bg-transparent'}`}
              onClick={() => handlePlayExternalLink('marco')}
              disabled={!selectedMeditation.marcoLink}
              type="button"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Probeer Marco
            </Button>
          </div>
        )}
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
      
      <div className="mb-4">
        <QuoteDisplay quote={randomQuote} transparentBackground={true} />
      </div>
      
      <div className="flex gap-2 mb-4">
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
      
      <AudioPlayer 
        key={playerKey}
        audioUrl={currentAudioUrl || ''}
        title={selectedMeditation.title}
        showTitle
        showControls
        showQuote={false}
        className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg shadow-sm"
        onError={handleAudioError}
        isPlayingExternal={isPlaying}
        onPlayPauseChange={setIsPlaying}
        ref={audioRef}
      />
    </div>
  );
}
