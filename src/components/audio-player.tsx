
import React, { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { ProgressBar } from "./audio-player/progress-bar";
import { AudioControls } from "./audio-player/audio-controls";
import { ErrorMessage } from "./audio-player/error-message";
import { QuoteDisplay } from "./audio-player/quote-display";
import { getRandomQuote, validateAudioUrl } from "./audio-player/utils";
import { PlayerContainer } from "./audio-player/player-container";

interface AudioPlayerProps {
  audioUrl: string;
  showControls?: boolean;
  showTitle?: boolean;
  title?: string;
  className?: string;
  onEnded?: () => void;
  onError?: () => void;
  showQuote?: boolean;
  isPlayingExternal?: boolean;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  nextAudioUrl?: string;
  onCrossfadeStart?: () => void;
  volume?: number;
}

export const AudioPlayer = forwardRef<HTMLAudioElement, AudioPlayerProps>(({ 
  audioUrl, 
  showControls = true, 
  showTitle = false,
  title,
  className, 
  onEnded,
  onError,
  showQuote = false,
  isPlayingExternal,
  onPlayPauseChange,
  nextAudioUrl,
  onCrossfadeStart,
  volume
}, ref) => {
  const [randomQuote] = useState(getRandomQuote);
  const nextAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const [audioKey, setAudioKey] = useState(0); 
  
  // Process and fix audio URL if needed
  const processedAudioUrl = audioUrl ? validateAudioUrl(audioUrl) : "";
  const effectiveAudioUrl = processedAudioUrl || "";
  
  // Initialize all hooks unconditionally
  const {
    audioRef,
    nextAudioRef,
    isPlaying,
    duration,
    currentTime,
    volume: audioVolume,
    isLooping,
    isLoaded,
    loadError,
    isRetrying,
    isCrossfading,
    isLiveStream,
    togglePlay,
    handleRetry,
    toggleLoop,
    handleProgressChange,
    handleVolumeChange,
    skipTime
  } = useAudioPlayer({
    audioUrl: effectiveAudioUrl,
    onEnded,
    onError,
    isPlayingExternal,
    onPlayPauseChange,
    nextAudioUrl: nextAudioUrl ? validateAudioUrl(nextAudioUrl) : undefined,
    onCrossfadeStart,
    title,
    volume
  });
  
  // Log the audio URL for debugging
  useEffect(() => {
    console.log(`AudioPlayer attempting to load: ${effectiveAudioUrl || "no URL provided"}`);
    
    // Reset player when URL changes
    setAudioKey(prev => prev + 1);
  }, [effectiveAudioUrl]);
  
  // Expose the audio element ref to parent components
  useImperativeHandle(ref, () => audioRef.current!, []);
  
  // Connect the nextAudioRef to its element
  useEffect(() => {
    nextAudioRef.current = nextAudioElementRef.current;
  }, [nextAudioRef]);
  
  // Early return with placeholder if no audioUrl
  if (!effectiveAudioUrl) {
    return (
      <div className={cn("w-full space-y-3 rounded-lg p-3 bg-card/50 shadow-sm", className)}>
        <div className="text-center py-3 text-muted-foreground">
          <p>Geen audio URL opgegeven</p>
        </div>
      </div>
    );
  }
  
  return (
    <PlayerContainer 
      audioRef={audioRef}
      nextAudioElementRef={nextAudioElementRef}
      effectiveAudioUrl={effectiveAudioUrl}
      nextAudioUrl={nextAudioUrl ? validateAudioUrl(nextAudioUrl) : undefined}
      showTitle={showTitle}
      title={title}
      isAACFormat={false}
      loadError={loadError}
      handleRetry={handleRetry}
      isRetrying={isRetrying}
      isPlaying={isPlaying}
    >
      {loadError && (
        <ErrorMessage handleRetry={handleRetry} isRetrying={isRetrying} />
      )}
      
      {showQuote && (
        <QuoteDisplay quote={randomQuote} />
      )}
      
      <ProgressBar
        currentTime={currentTime}
        duration={duration}
        isLoaded={isLoaded}
        isCrossfading={isCrossfading}
        isLiveStream={isLiveStream}
        handleProgressChange={handleProgressChange}
      />
      
      {showControls && (
        <AudioControls
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          skipTime={skipTime}
          isLoaded={isLoaded}
          isLooping={isLooping}
          toggleLoop={toggleLoop}
          isCrossfading={isCrossfading}
          isLiveStream={isLiveStream}
          volume={audioVolume}
          handleVolumeChange={handleVolumeChange}
          loadError={loadError}
        />
      )}
    </PlayerContainer>
  );
});

AudioPlayer.displayName = "AudioPlayer";
