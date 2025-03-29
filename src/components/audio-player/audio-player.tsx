
import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { ProgressBar } from "./progress-bar";
import { AudioControls } from "./audio-controls";
import { ErrorMessage } from "./error-message";
import { QuoteDisplay } from "./quote-display";
import { MusicSelector } from "./music-selector";
import { NowPlaying } from "./now-playing";
import { getRandomQuote, validateAudioUrl } from "./utils";
import { Soundscape } from "@/lib/types";
import { AudioPlayerProps } from "./types";

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
  onCrossfadeStart,
  volume,
  showMusicSelector = false
}, ref) => {
  const [randomQuote] = useState(getRandomQuote);
  const [audioKey, setAudioKey] = useState(0); 
  const [isAACFormat, setIsAACFormat] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<string>("");
  
  // Process and fix audio URL if needed
  const processedAudioUrl = audioUrl ? validateAudioUrl(audioUrl) : "";
  const processedSelectedMusic = selectedMusic ? validateAudioUrl(selectedMusic) : "";
  const effectiveAudioUrl = processedSelectedMusic || processedAudioUrl || "";
  
  useEffect(() => {
    if (!selectedMusic && audioUrl) {
      setSelectedMusic(audioUrl);
    }
  }, [audioUrl]);
  
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
  
  // Handle music selection change
  const handleMusicChange = (value: string) => {
    setSelectedMusic(value);
    if (onPlayPauseChange) {
      onPlayPauseChange(true);
    }
  };
  
  // Expose the audio element ref to parent components
  useImperativeHandle(ref, () => audioRef.current!, []);
  
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
    <div className={cn("w-full space-y-3 rounded-lg p-3 bg-card/50 shadow-sm", className)}>
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous">
        <source src={effectiveAudioUrl} type={getAudioMimeType(effectiveAudioUrl)} />
        Your browser does not support the audio element.
      </audio>
      
      {nextAudioUrl && (
        <audio ref={nextAudioRef.current} preload="metadata" crossOrigin="anonymous">
          <source src={validateAudioUrl(nextAudioUrl)} type={getAudioMimeType(nextAudioUrl)} />
        </audio>
      )}
      
      {showMusicSelector && (
        <MusicSelector 
          selectedMusic={selectedMusic || audioUrl} 
          onMusicChange={handleMusicChange} 
        />
      )}
      
      {isPlaying && (
        <NowPlaying 
          selectedMusic={selectedMusic || audioUrl} 
          title={title} 
        />
      )}
      
      {showTitle && title && !showMusicSelector && (
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
          volume={audioVolume}
          handleVolumeChange={handleVolumeChange}
          loadError={loadError}
        />
      )}
    </div>
  );
});

AudioPlayer.displayName = "AudioPlayer";
