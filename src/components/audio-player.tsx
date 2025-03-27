
import React, { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { ProgressBar } from "./audio-player/progress-bar";
import { AudioControls } from "./audio-player/audio-controls";
import { ErrorMessage } from "./audio-player/error-message";
import { QuoteDisplay } from "./audio-player/quote-display";
import { getRandomQuote, getAudioMimeType, isAACFile, validateAudioUrl, preloadAudio } from "./audio-player/utils";

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
  nextAudioUrl?: string;
  onCrossfadeStart?: () => void;
}

export const AudioPlayer = forwardRef<HTMLAudioElement, AudioPlayerProps>(({ 
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
  onCrossfadeStart
}, ref) => {
  const [randomQuote] = useState(getRandomQuote);
  const nextAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const [audioKey, setAudioKey] = useState(0); // Add a key to force remounting
  const [isAACFormat, setIsAACFormat] = useState(false);
  const [validatedUrl, setValidatedUrl] = useState<string>("");
  
  // Validate and preload the audio when URL changes
  useEffect(() => {
    if (audioUrl) {
      const cleanUrl = validateAudioUrl(audioUrl);
      setValidatedUrl(cleanUrl);
      setIsAACFormat(isAACFile(cleanUrl));
      
      // Preload audio file to browser cache
      preloadAudio(cleanUrl);
    }
  }, [audioUrl]);
  
  // Initialize all hooks unconditionally
  const {
    audioRef,
    nextAudioRef,
    isPlaying,
    duration,
    currentTime,
    volume,
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
    audioUrl: validatedUrl || "",
    onEnded,
    onError,
    isPlayingExternal,
    onPlayPauseChange,
    nextAudioUrl,
    onCrossfadeStart,
    title
  });
  
  // Enhanced logging for audio playback
  useEffect(() => {
    if (validatedUrl) {
      console.log(`AudioPlayer attempting to load: ${validatedUrl}`);
      
      if (isAACFile(validatedUrl)) {
        console.log('AAC audio format detected:', validatedUrl);
      }
      
      // Get the MIME type
      const mimeType = getAudioMimeType(validatedUrl);
      console.log(`Audio MIME type: ${mimeType} for ${validatedUrl}`);
    }
    
    // Reset player when URL changes
    setAudioKey(prev => prev + 1);
  }, [validatedUrl]);
  
  // Expose the audio element ref to parent components
  useImperativeHandle(ref, () => audioRef.current!, []);
  
  // Connect the nextAudioRef to its element
  useEffect(() => {
    nextAudioRef.current = nextAudioElementRef.current;
  }, [nextAudioRef]);
  
  // Early return with placeholder if no audioUrl
  if (!validatedUrl) {
    return (
      <div className={cn("w-full space-y-3 rounded-lg p-3 bg-card/50 shadow-sm", className)}>
        <div className="text-center py-3 text-muted-foreground">
          <p>Geen audio URL opgegeven</p>
        </div>
      </div>
    );
  }
  
  // Get the MIME type based on the file extension
  const audioMimeType = getAudioMimeType(validatedUrl);
  
  return (
    <div className={cn("w-full space-y-3 rounded-lg p-3 bg-card/50 shadow-sm", className)}>
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous">
        <source src={validatedUrl} type={audioMimeType} />
        Your browser does not support the audio element.
      </audio>
      
      {nextAudioUrl && (
        <audio ref={nextAudioElementRef} preload="metadata" crossOrigin="anonymous">
          <source src={nextAudioUrl} type={getAudioMimeType(nextAudioUrl)} />
        </audio>
      )}
      
      {showTitle && title && (
        <h3 className="text-lg font-medium">{title}</h3>
      )}
      
      {isAACFormat && (
        <div className="text-xs text-blue-500 font-medium">
          AAC audio format
        </div>
      )}
      
      {loadError && (
        <ErrorMessage handleRetry={handleRetry} isRetrying={isRetrying} />
      )}
      
      {showQuote && (
        <QuoteDisplay quote={randomQuote} />
      )}
      
      {customSoundscapeSelector && !showQuote && (
        <div className="mb-2">{customSoundscapeSelector}</div>
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
          volume={volume}
          handleVolumeChange={handleVolumeChange}
          loadError={loadError}
        />
      )}
    </div>
  );
});

AudioPlayer.displayName = "AudioPlayer";
