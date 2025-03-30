
import React from "react";
import { cn } from "@/lib/utils";
import { Volume2 } from "lucide-react";
import { getAudioMimeType } from "./utils";

interface PlayerContainerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  nextAudioElementRef: React.RefObject<HTMLAudioElement>;
  effectiveAudioUrl: string;
  nextAudioUrl?: string;
  showTitle: boolean;
  title?: string;
  isAACFormat: boolean;
  loadError: boolean;
  handleRetry: () => void;
  isRetrying: boolean;
  isPlaying: boolean;
  children: React.ReactNode;
}

export const PlayerContainer: React.FC<PlayerContainerProps> = ({
  audioRef,
  nextAudioElementRef,
  effectiveAudioUrl,
  nextAudioUrl,
  showTitle,
  title,
  isAACFormat,
  loadError,
  handleRetry,
  isRetrying,
  isPlaying,
  children
}) => {
  const audioMimeType = getAudioMimeType(effectiveAudioUrl);

  return (
    <div className="w-full space-y-3 rounded-lg p-3 bg-card/50 shadow-sm">
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous">
        <source src={effectiveAudioUrl} type={audioMimeType} />
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
      
      {isPlaying && (
        <div className="py-2 px-3 bg-background/30 border border-muted rounded-md flex items-center">
          <Volume2 className="h-4 w-4 text-primary mr-2" />
          <p className="text-sm">
            Nu afspelend: {title}
          </p>
        </div>
      )}
      
      {children}
    </div>
  );
};
