
import React, { useState, useEffect, useRef } from "react";
import { Meditation } from "@/lib/types";
import { toast } from "sonner";
import { validateAudioUrl, checkUrlExists } from "@/components/audio-player/utils";
import { MeditationPlayerContainerProps } from "./types";
import { MeditationErrorView } from "./meditation-error-view";
import { MeditationLoadingView } from "./meditation-loading-view";
import { MeditationCoverImage, ImageErrorMessage } from "./meditation-cover-image";
import { MeditationPlayerControls } from "./meditation-player-controls";
import { MeditationAudioPlayer } from "./meditation-audio-player";

export function MeditationPlayerContainer({ 
  isVisible, 
  selectedMeditation 
}: MeditationPlayerContainerProps) {
  const [audioError, setAudioError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>("");
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
      let urlToTry = selectedMeditation.audioUrl || "";
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
    return <MeditationLoadingView />;
  }

  if (!hasValidAudio || audioError) {
    return (
      <MeditationErrorView 
        selectedMeditation={selectedMeditation}
        handleRetryAudio={handleRetryAudio}
        isRetrying={isRetrying}
        onPlayExternalLink={handlePlayExternalLink}
      />
    );
  }

  return (
    <div className="mt-4">
      <MeditationPlayerControls 
        isPlaying={isPlaying}
        onStop={handleStopPlaying}
        onStart={handleStartPlaying}
        title={selectedMeditation.title}
      />

      {hasValidImage && !imageError && (
        <MeditationCoverImage
          imageUrl={selectedMeditation.coverImageUrl}
          title={selectedMeditation.title}
          onError={handleImageError}
        />
      )}
      
      {imageError && <ImageErrorMessage />}
      
      <MeditationAudioPlayer
        key={playerKey}
        currentAudioUrl={currentAudioUrl}
        selectedMeditation={selectedMeditation}
        handleAudioError={handleAudioError}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        audioRef={audioRef}
      />
    </div>
  );
}
