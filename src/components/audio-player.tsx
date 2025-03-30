
import React, { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { ProgressBar } from "./audio-player/progress-bar";
import { AudioControls } from "./audio-player/audio-controls";
import { ErrorMessage } from "./audio-player/error-message";
import { QuoteDisplay } from "./audio-player/quote-display";
import { getRandomQuote, getAudioMimeType, isAACFile, validateAudioUrl } from "./audio-player/utils";
import { Soundscape } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { PlayerContainer } from "./audio-player/player-container";
import { AudioPlayerProvider } from "./audio-player/audio-player-context";
import { MusicSelector } from "./audio-player/music-selector";

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
  volume?: number;
  showMusicSelector?: boolean;
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
  onCrossfadeStart,
  volume,
  showMusicSelector = false
}, ref) => {
  const { soundscapes } = useApp();
  const [randomQuote] = useState(getRandomQuote);
  const nextAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const [audioKey, setAudioKey] = useState(0); 
  const [isAACFormat, setIsAACFormat] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<string>("");
  
  // Filter music tracks
  const musicTracks = soundscapes.filter(track => track.category === "Muziek");
  
  // Process and fix audio URL if needed
  const processedAudioUrl = audioUrl ? validateAudioUrl(audioUrl) : "";
  const processedSelectedMusic = selectedMusic ? validateAudioUrl(selectedMusic) : "";
  const effectiveAudioUrl = processedSelectedMusic || processedAudioUrl || "";
  
  useEffect(() => {
    if (!selectedMusic && audioUrl) {
      setSelectedMusic(audioUrl);
    }
  }, [audioUrl]);
  
  useEffect(() => {
    if (effectiveAudioUrl) {
      setIsAACFormat(isAACFile(effectiveAudioUrl));
    }
  }, [effectiveAudioUrl]);
  
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
    
    if (isAACFile(effectiveAudioUrl)) {
      console.log('AAC audio format detected:', effectiveAudioUrl);
    }
    
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
    <AudioPlayerProvider
      currentTrack={musicTracks.find(track => track.audioUrl === (selectedMusic || audioUrl)) || null}
      isTrackPlaying={isPlaying}
      musicTracks={musicTracks}
      selectedMusic={selectedMusic}
      handleMusicChange={handleMusicChange}
    >
      <PlayerContainer 
        audioRef={audioRef}
        nextAudioElementRef={nextAudioElementRef}
        effectiveAudioUrl={effectiveAudioUrl}
        nextAudioUrl={nextAudioUrl ? validateAudioUrl(nextAudioUrl) : undefined}
        showTitle={showTitle && !showMusicSelector}
        title={title}
        isAACFormat={isAACFormat}
        loadError={loadError}
        isPlaying={isPlaying}
      >
        {showMusicSelector && (
          <MusicSelector audioUrl={audioUrl} />
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
      </PlayerContainer>
    </AudioPlayerProvider>
  );
});

AudioPlayer.displayName = "AudioPlayer";
