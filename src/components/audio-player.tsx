
import React, { useState } from "react";
import { useAudioPlayer } from "@/hooks/audio-player";
import { AudioControls } from "./audio-player/audio-controls";
import { ProgressBar } from "./audio-player/progress-bar";
import { PlayerContainer } from "./audio-player/player-container";
import { ErrorMessage } from "./audio-player/error-message";
import { QuoteDisplay } from "./audio-player/quote-display";
import { DailyQuote } from "@/lib/types";

export interface AudioPlayerProps {
  audioUrl?: string;
  title?: string;
  onEnded?: () => void;
  showTitle?: boolean;
  autoPlay?: boolean;
  nextAudioUrl?: string;
  loop?: boolean;
  quote?: DailyQuote; 
  onPlay?: () => void;
  onPause?: () => void;
  initialVolume?: number;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  title,
  onEnded,
  showTitle = true,
  autoPlay = false,
  nextAudioUrl,
  loop = false,
  quote,
  onPlay,
  onPause,
  initialVolume,
  className
}) => {
  const [showQuote, setShowQuote] = useState(false);

  const {
    audioRef,
    nextAudioRef,
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    volume,
    handleVolumeChange,
    handleTogglePlay,
    handleSeek,
    handlePrevious,
    handleNext,
    toggleLoop,
    isLooping,
    effectiveAudioUrl,
    isAACFormat,
    loadError,
    handleRetry,
    isRetrying,
    isLiveStream
  } = useAudioPlayer({
    audioUrl,
    nextAudioUrl,
    onEnded,
    autoPlay,
    loop,
    onPlay,
    onPause,
    initialVolume
  });

  const defaultQuote: DailyQuote = {
    id: "temp-id",
    text: "Adem diep in, en voel je lichaam ontspannen.",
    author: "ZenMind"
  };

  return (
    <div className={className}>
      <PlayerContainer
        audioRef={audioRef}
        nextAudioElementRef={nextAudioRef}
        effectiveAudioUrl={effectiveAudioUrl}
        nextAudioUrl={nextAudioUrl}
        showTitle={showTitle}
        title={title}
        isAACFormat={isAACFormat}
        loadError={loadError}
        handleRetry={handleRetry}
        isRetrying={isRetrying}
        isPlaying={isPlaying}
      >
        {loadError ? (
          <ErrorMessage onRetry={handleRetry} isRetrying={isRetrying} />
        ) : (
          <>
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
              isLiveStream={isLiveStream}
            />

            <AudioControls
              isPlaying={isPlaying}
              onPlayPause={handleTogglePlay}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onToggleLoop={toggleLoop}
              isLooping={isLooping}
              volume={volume}
              onVolumeChange={handleVolumeChange}
              hasNextTrack={Boolean(nextAudioUrl)}
              isLiveStream={isLiveStream}
              showQuote={showQuote}
              onToggleQuote={() => setShowQuote(!showQuote)}
              hasQuote={Boolean(quote)}
            />

            {showQuote && (quote || defaultQuote) && (
              <QuoteDisplay
                quote={quote || defaultQuote}
                onClose={() => setShowQuote(false)}
              />
            )}
          </>
        )}
      </PlayerContainer>
    </div>
  );
};
