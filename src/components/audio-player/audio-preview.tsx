
import React from "react";
import { useAudioPreview } from "./hooks/use-audio-preview";
import { AudioErrorMessage } from "./components/audio-error-message";
import { AudioDisplay } from "./components/audio-display";
import { getAudioMimeType } from "./utils";
import { useToast } from "@/hooks/use-toast";

interface AudioPreviewProps {
  url: string;
  label?: string;
  showControls?: boolean;
  autoPlay?: boolean;
  onEnded?: () => void;
  onError?: () => void;
  onLoaded?: () => void;
}

export const AudioPreview: React.FC<AudioPreviewProps> = ({
  url,
  label,
  showControls = true,
  autoPlay = false,
  onEnded,
  onError,
  onLoaded
}) => {
  const { toast } = useToast();
  
  const {
    audioRef,
    isPlaying,
    progress,
    volume,
    muted,
    error,
    loaded,
    isRetrying,
    isValidUrl,
    validatedUrl,
    togglePlay,
    toggleMute,
    handleVolumeChange,
    handleRetry,
    getFileNameFromUrl
  } = useAudioPreview({
    url,
    autoPlay,
    onEnded,
    onError,
    onLoaded
  });

  const displayUrl = label || getFileNameFromUrl(validatedUrl || url);

  if (!url) {
    return (
      <div className="text-sm text-muted-foreground p-2 italic">
        Geen URL opgegeven
      </div>
    );
  }

  return (
    <div className="p-2 rounded-md bg-muted/20 space-y-2 border border-border/50">
      <audio 
        ref={audioRef} 
        preload="metadata" 
        src={validatedUrl}
      >
        <source src={validatedUrl} type={getAudioMimeType(validatedUrl)} />
        Your browser does not support the audio element.
      </audio>

      {error ? (
        <AudioErrorMessage 
          handleRetry={handleRetry} 
          isRetrying={isRetrying} 
          message={!isValidUrl ? "Ongeldige URL. Controleer het formaat." : "Kan audio niet laden. Controleer de URL."}
        />
      ) : (
        <AudioDisplay
          displayUrl={displayUrl}
          loaded={loaded}
          showControls={showControls}
          isPlaying={isPlaying}
          progress={progress}
          volume={volume}
          muted={muted}
          togglePlay={togglePlay}
          toggleMute={toggleMute}
          handleVolumeChange={handleVolumeChange}
          error={error}
        />
      )}
    </div>
  );
};
