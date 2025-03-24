
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { quotes } from "@/data/quotes";
import { useAudioEngine } from "./audio/audio-engine";
import { ProgressBar } from "./audio/progress-bar";
import { PlayerControls } from "./audio/player-controls";
import { VolumeControl } from "./audio/volume-control";
import { ErrorMessage } from "./audio/error-message";
import { QuoteDisplay } from "./audio/quote-display";
import { checkAudioCompatibility } from "@/utils/meditation-utils";
import { toast } from "sonner";

interface AudioPlayerProps {
  audioUrl: string;
  showControls?: boolean;
  showTitle?: boolean;
  title?: string;
  className?: string;
  onEnded?: () => void;
  onError?: () => void;
  customSoundscapeSelector?: React.ReactNode;
  showQuote?: boolean;
  isPlayingExternal?: boolean;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  nextAudioUrl?: string; // URL for the next track to crossfade
  onCrossfadeStart?: () => void; // Called when crossfade starts
  onAudioElementRef?: (element: HTMLAudioElement | null) => void;
}

export function AudioPlayer({ 
  audioUrl, 
  showControls = true, 
  showTitle = false,
  title,
  className, 
  onEnded,
  onError,
  customSoundscapeSelector,
  showQuote = false,
  isPlayingExternal,
  onPlayPauseChange,
  nextAudioUrl,
  onCrossfadeStart,
  onAudioElementRef
}: AudioPlayerProps) {
  // Initialize with a random quote
  const [randomQuote] = useState(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  });
  
  // Check audio URL before attempting to play
  const [urlChecked, setUrlChecked] = useState(false);
  const [urlValid, setUrlValid] = useState(true);
  
  useEffect(() => {
    const validateAudioUrl = async () => {
      if (!audioUrl) {
        console.error("No audio URL provided");
        setUrlValid(false);
        setUrlChecked(true);
        if (onError) onError();
        return;
      }
      
      try {
        console.log("Checking audio compatibility for:", audioUrl);
        const isCompatible = await checkAudioCompatibility(audioUrl);
        setUrlValid(isCompatible);
        
        if (!isCompatible) {
          console.error("Audio format not supported:", audioUrl);
          toast.error("Dit audioformaat wordt niet ondersteund");
          if (onError) onError();
        }
      } catch (error) {
        console.error("Error checking audio compatibility:", error);
        setUrlValid(false);
        if (onError) onError();
      } finally {
        setUrlChecked(true);
      }
    };
    
    setUrlChecked(false);
    validateAudioUrl();
  }, [audioUrl, onError]);
  
  // Use our custom audio engine hook to manage audio state and controls
  const {
    isPlaying,
    duration,
    currentTime,
    isLoaded,
    loadError,
    isRetrying,
    isCrossfading,
    isLiveStream,
    audioRef,
    nextAudioRef,
    handleProgressChange,
    handleVolumeChange,
    togglePlay,
    toggleLoop,
    handleRetry,
    skipTime,
    isLooping
  } = useAudioEngine({
    audioUrl,
    isPlayingExternal,
    onPlayPauseChange,
    volume: 0.8, // Initial volume
    isLooping: false, // Initial looping state
    onAudioElementRef,
    onEnded,
    onError: () => {
      if (onError) onError();
    },
    nextAudioUrl,
    onCrossfadeStart,
  });
  
  // Log the current audio state for debugging
  useEffect(() => {
    console.log("Audio player state:", {
      audioUrl,
      isPlaying,
      isLoaded,
      loadError,
      duration,
      urlChecked,
      urlValid
    });
  }, [audioUrl, isPlaying, isLoaded, loadError, duration, urlChecked, urlValid]);
  
  // Check if we have any errors to display
  const hasError = loadError || (urlChecked && !urlValid);
  
  return (
    <div className={cn("w-full space-y-3 rounded-lg p-3 bg-card/50 shadow-sm", className)}>
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" />
      {nextAudioUrl && <audio ref={nextAudioRef} preload="metadata" crossOrigin="anonymous" />}
      
      {showTitle && title && (
        <h3 className="text-lg font-medium">{title}</h3>
      )}
      
      {hasError && (
        <ErrorMessage 
          onRetry={() => {
            if (!urlValid) {
              setUrlChecked(false);
              setUrlValid(true);
              setTimeout(() => validateAudioUrl(), 500);
            } else {
              handleRetry();
            }
          }} 
          isRetrying={isRetrying} 
        />
      )}
      
      {showQuote && (
        <QuoteDisplay text={randomQuote.text} author={randomQuote.author} />
      )}
      
      {customSoundscapeSelector && !showQuote && (
        <div className="mb-2">{customSoundscapeSelector}</div>
      )}
      
      <ProgressBar
        currentTime={currentTime}
        duration={duration}
        isLoaded={isLoaded && !hasError}
        isCrossfading={isCrossfading}
        isLiveStream={isLiveStream}
        onProgressChange={handleProgressChange}
      />
      
      {showControls && (
        <div className="flex items-center justify-between">
          <PlayerControls
            isPlaying={isPlaying}
            isLoaded={isLoaded && !hasError}
            loadError={hasError}
            isLooping={isLooping}
            isCrossfading={isCrossfading}
            isLiveStream={isLiveStream}
            togglePlay={togglePlay}
            toggleLoop={toggleLoop}
            skipTime={skipTime}
          />
          
          <VolumeControl
            volume={0.8}
            onVolumeChange={handleVolumeChange}
          />
        </div>
      )}
    </div>
  );
  
  async function validateAudioUrl() {
    if (!audioUrl) {
      console.error("No audio URL provided");
      setUrlValid(false);
      setUrlChecked(true);
      if (onError) onError();
      return;
    }
    
    try {
      console.log("Checking audio compatibility for:", audioUrl);
      const isCompatible = await checkAudioCompatibility(audioUrl);
      setUrlValid(isCompatible);
      
      if (!isCompatible) {
        console.error("Audio format not supported:", audioUrl);
        toast.error("Dit audioformaat wordt niet ondersteund");
        if (onError) onError();
      }
    } catch (error) {
      console.error("Error checking audio compatibility:", error);
      setUrlValid(false);
      if (onError) onError();
    } finally {
      setUrlChecked(true);
    }
  }
}
