
import React, { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { ProgressBar } from "./audio-player/progress-bar";
import { AudioControls } from "./audio-player/audio-controls";
import { ErrorMessage } from "./audio-player/error-message";
import { QuoteDisplay } from "./audio-player/quote-display";
import { getRandomQuote, getAudioMimeType, isAACFile } from "./audio-player/utils";
import { Soundscape } from "@/lib/types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Music, Volume2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

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
  const [selectedMusic, setSelectedMusic] = useState<string>(audioUrl);
  
  // Filter music tracks
  const musicTracks = soundscapes.filter(track => track.category === "Muziek");
  
  useEffect(() => {
    if (audioUrl) {
      setIsAACFormat(isAACFile(audioUrl));
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
    audioUrl: selectedMusic || audioUrl || "",
    onEnded,
    onError,
    isPlayingExternal,
    onPlayPauseChange,
    nextAudioUrl,
    onCrossfadeStart,
    title,
    volume
  });
  
  // Log the audio URL for debugging
  useEffect(() => {
    console.log(`AudioPlayer attempting to load: ${audioUrl || "no URL provided"}`);
    
    if (isAACFile(audioUrl)) {
      console.log('AAC audio format detected:', audioUrl);
    }
    
    // Reset player when URL changes
    setAudioKey(prev => prev + 1);
  }, [audioUrl]);
  
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
  if (!audioUrl && !selectedMusic) {
    return (
      <div className={cn("w-full space-y-3 rounded-lg p-3 bg-card/50 shadow-sm", className)}>
        <div className="text-center py-3 text-muted-foreground">
          <p>Geen audio URL opgegeven</p>
        </div>
      </div>
    );
  }
  
  // Get the MIME type based on the file extension
  const audioMimeType = getAudioMimeType(selectedMusic || audioUrl);
  
  return (
    <div className={cn("w-full space-y-3 rounded-lg p-3 bg-card/50 shadow-sm", className)}>
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous">
        <source src={selectedMusic || audioUrl} type={audioMimeType} />
        Your browser does not support the audio element.
      </audio>
      
      {nextAudioUrl && (
        <audio ref={nextAudioElementRef} preload="metadata" crossOrigin="anonymous">
          <source src={nextAudioUrl} type={getAudioMimeType(nextAudioUrl)} />
        </audio>
      )}
      
      {showMusicSelector && (
        <div className="mb-4">
          <h3 className="text-base font-semibold mb-2">Muziek op de achtergrond</h3>
          <Select
            value={selectedMusic || audioUrl}
            onValueChange={handleMusicChange}
          >
            <SelectTrigger className="w-full bg-background border-muted">
              <span className="flex items-center">
                <Music className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Selecteer muziek">
                  {musicTracks.find(track => track.audioUrl === (selectedMusic || audioUrl))?.title || "Selecteer muziek"}
                </SelectValue>
              </span>
            </SelectTrigger>
            <SelectContent>
              {musicTracks.map(track => (
                <SelectItem key={track.id} value={track.audioUrl}>
                  <div className="flex items-center">
                    {track.audioUrl === (selectedMusic || audioUrl) && (
                      <Volume2 className="w-4 h-4 mr-2 text-primary animate-pulse" />
                    )}
                    <span>{track.title}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {isPlaying && (
        <div className="py-2 px-3 bg-background/30 border border-muted rounded-md flex items-center">
          <Volume2 className="h-4 w-4 text-primary mr-2" />
          <p className="text-sm">
            Nu afspelend: {musicTracks.find(track => track.audioUrl === (selectedMusic || audioUrl))?.title || title}
          </p>
        </div>
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
