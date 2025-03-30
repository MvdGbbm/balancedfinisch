
import React from "react";
import { AudioPlayer } from "@/components/audio-player";
import { Label } from "@/components/ui/label";
import { AudioPreviewProps } from "../types";

export const AudioPreview: React.FC<AudioPreviewProps> = ({
  audioUrl,
  isPreviewPlaying,
  setIsPreviewPlaying,
  isValidatingUrl,
  isUrlValid,
  validatedUrl,
  audioRef,
  handleAudioError,
}) => {
  if (!audioUrl || !isPreviewPlaying || !isUrlValid) {
    return null;
  }

  return (
    <div>
      <Label className="text-xs">Audio Preview</Label>
      <AudioPlayer 
        audioUrl={validatedUrl || audioUrl} 
        isPlayingExternal={isPreviewPlaying}
        onPlayPauseChange={setIsPreviewPlaying}
        onError={handleAudioError}
        ref={audioRef}
      />
    </div>
  );
};
