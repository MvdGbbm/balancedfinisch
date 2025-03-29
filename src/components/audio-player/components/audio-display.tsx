
import React from "react";
import { AudioControls } from "./audio-controls";

interface AudioDisplayProps {
  displayUrl: string;
  loaded: boolean;
  isPlaying: boolean;
  progress: number;
  volume: number;
  muted: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  handleVolumeChange: (values: number[]) => void;
  error: boolean;
  showControls: boolean;
}

export const AudioDisplay: React.FC<AudioDisplayProps> = ({
  displayUrl,
  loaded,
  showControls,
  isPlaying,
  progress,
  volume,
  muted,
  togglePlay,
  toggleMute,
  handleVolumeChange,
  error
}) => {
  return (
    <>
      <div className="text-sm font-medium truncate" title={displayUrl}>
        {displayUrl}
      </div>

      {loaded && showControls && (
        <AudioControls
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
    </>
  );
};
