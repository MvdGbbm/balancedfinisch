
import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Volume1, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { AudioPreview } from "./audio-player/audio-preview";
import { validateAudioUrl, preloadAudio } from "./audio-player/utils";
import { QuoteDisplay } from "./audio-player/quote-display";
import { getRandomQuote } from "./audio-player/utils";

export interface AudioPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  audioUrl: string;
  showControls?: boolean;
  isPlayingExternal?: boolean;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  onError?: () => void;
  volume?: number;
  title?: string;
  showTitle?: boolean;
  showQuote?: boolean;
  nextAudioUrl?: string;
  onEnded?: () => void;
  onCrossfadeStart?: () => void;
  showMusicSelector?: boolean;
}

export const AudioPlayer = forwardRef<HTMLAudioElement | null, AudioPlayerProps>(
  ({ 
    audioUrl, 
    showControls = true, 
    className, 
    isPlayingExternal,
    onPlayPauseChange,
    onError,
    volume: externalVolume,
    title,
    showTitle = false,
    showQuote = true,
    nextAudioUrl,
    onEnded,
    onCrossfadeStart,
    showMusicSelector = false
  }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [validatedUrl, setValidatedUrl] = useState("");
    const [quote] = useState(() => {
      const randomQuote = getRandomQuote();
      return {
        ...randomQuote,
        id: randomQuote.id || `quote-${Date.now()}`
      };
    });
    
    // Process and validate the URL
    useEffect(() => {
      const processUrl = async () => {
        setIsLoading(true);
        setError(false);
        
        if (!audioUrl) {
          setIsLoading(false);
          setError(true);
          return;
        }
        
        // Validate and normalize the URL
        const processed = validateAudioUrl(audioUrl);
        if (!processed) {
          setIsLoading(false);
          setError(true);
          if (onError) onError();
          return;
        }
        
        setValidatedUrl(processed);
        console.log("AudioPlayer attempting to load:", processed);
        
        // Preload to check if audio is valid
        const canPlay = await preloadAudio(processed);
        if (!canPlay) {
          setIsLoading(false);
          setError(true);
          if (onError) onError();
        } else {
          setIsLoading(false);
          setError(false);
        }
      };
      
      processUrl();
    }, [audioUrl, onError]);
    
    const {
      audioRef,
      isPlaying,
      duration,
      currentTime,
      volume,
      togglePlay,
      handleVolumeChange,
      loadError,
      handleRetry
    } = useAudioPlayer({
      audioUrl: validatedUrl,
      isPlayingExternal,
      onPlayPauseChange,
      onError,
      volume: externalVolume,
      nextAudioUrl,
      onEnded,
      onCrossfadeStart,
      title
    });
    
    // Expose the audio element ref
    useImperativeHandle(ref, () => audioRef.current);
    
    // If we've identified an error, show better error UI
    const finalError = error || loadError;
    
    // Don't show anything if URL is empty
    if (!audioUrl) {
      return null;
    }
    
    // If not showing controls, just render the hidden audio element
    if (!showControls) {
      return (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={togglePlay} 
          className={cn("h-8 w-8 p-0 rounded-full", className)}
          disabled={finalError}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <audio ref={audioRef} style={{ display: 'none' }} />
        </Button>
      );
    }
    
    return (
      <div className={cn("space-y-2", className)}>
        {showTitle && title && (
          <div className="text-sm font-medium mb-1">{title}</div>
        )}
        
        {showQuote && !finalError && (
          <div className="mb-3">
            <QuoteDisplay quote={quote} transparentBackground={true} />
          </div>
        )}
        
        {finalError ? (
          <AudioPreview 
            url={audioUrl} 
            onError={onError}
            label={audioUrl.split('/').pop() || audioUrl}
          />
        ) : (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              {isLoading ? (
                <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.01}
              className="flex-1"
              disabled={duration === 0 || isLoading}
            />
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVolumeChange([volume > 0 ? 0 : 0.7])}
                className="h-8 w-8 p-0"
              >
                {volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : volume < 0.5 ? (
                  <Volume1 className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <div className="w-16 hidden sm:block">
                <Slider
                  value={[volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>
          </div>
        )}
        <audio ref={audioRef} style={{ display: 'none' }} />
      </div>
    );
  }
);

AudioPlayer.displayName = "AudioPlayer";
