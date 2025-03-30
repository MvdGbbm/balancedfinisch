
import React from "react";
import { AudioPlayer } from "@/components/audio-player";
import { Label } from "@/components/ui/label";
import { ToneEqualizer } from "@/components/music/tone-equalizer";
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
      <ToneEqualizer isActive={isPreviewPlaying} className="mb-2" audioRef={audioRef} />
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
