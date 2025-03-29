
import React, { forwardRef } from "react";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { AudioControls } from "./audio-controls";
import { ProgressBar } from "./progress-bar";
import { ErrorMessage } from "./error-message";
import { QuoteDisplay } from "./quote-display";
import { SoundscapeSelector } from "@/components/soundscape-selector";
import { cn } from "@/lib/utils";
import { getRandomQuote } from "./utils";
import { MusicSelector } from "./music-selector";
import { NowPlaying } from "./now-playing";
import { AudioPlayerProps } from "./types";
import { validateAudioUrl, getMimeType } from "./utils";

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
    audioUrl,
    onEnded,
    onError,
    isPlayingExternal,
    onPlayPauseChange,
    nextAudioUrl,
    onCrossfadeStart,
    title,
    volume
  });

  const validatedAudioUrl = validateAudioUrl(audioUrl);
  const [selectedMusic, setSelectedMusic] = React.useState("");

  const handleMusicChange = (url: string) => {
    setSelectedMusic(url);
  };

  return (
    <div className={cn("p-3 space-y-2", className)}>
      {showTitle && title && (
        <h3 className="text-base font-medium">{title}</h3>
      )}

      {validatedAudioUrl ? (
        <>
          <audio 
            ref={(element) => {
              // Forward the ref to the parent component if provided
              if (typeof ref === 'function') {
                ref(element);
              } else if (ref) {
                ref.current = element;
              }
              // Also set our internal ref
              audioRef.current = element;
            }}
            preload="metadata" 
            crossOrigin="anonymous"
          >
            <source src={validatedAudioUrl} type={getMimeType(validatedAudioUrl)} />
            Your browser does not support the audio element.
          </audio>
          
          {nextAudioUrl && (
            <audio 
              ref={nextAudioRef} 
              preload="metadata" 
              crossOrigin="anonymous"
            >
              <source src={nextAudioUrl} type={getMimeType(nextAudioUrl)} />
            </audio>
          )}

          {showMusicSelector && (
            <MusicSelector 
              selectedMusic={selectedMusic} 
              onMusicChange={handleMusicChange} 
            />
          )}
          
          {selectedMusic && (
            <NowPlaying selectedMusic={selectedMusic} title={title} />
          )}
          
          {loadError ? (
            <ErrorMessage 
              handleRetry={handleRetry} 
              isRetrying={isRetrying} 
            />
          ) : (
            showControls && (
              <div className="space-y-2">
                <ProgressBar
                  currentTime={currentTime}
                  duration={duration}
                  isLoaded={isLoaded}
                  isCrossfading={isCrossfading}
                  isLiveStream={isLiveStream}
                  handleProgressChange={handleProgressChange}
                />
                
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
              </div>
            )
          )}
        </>
      ) : (
        <ErrorMessage 
          handleRetry={handleRetry} 
          isRetrying={isRetrying} 
          message="Invalid audio URL provided."
        />
      )}
      
      {showQuote && isLoaded && !loadError && (
        <QuoteDisplay quote={getRandomQuote()} />
      )}
      
      {customSoundscapeSelector && (
        <div className="mt-4">
          {customSoundscapeSelector}
        </div>
      )}
    </div>
  );
});

AudioPlayer.displayName = "AudioPlayer";
