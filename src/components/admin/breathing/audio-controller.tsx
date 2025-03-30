
import React from "react";
import { AudioControllerProps } from "./types";

export function AudioController({ audioRef, endAudioRef, currentAudioUrl }: AudioControllerProps) {
  return (
    <>
      <audio ref={audioRef} src={currentAudioUrl} />
      <audio ref={endAudioRef} /> 
    </>
  );
}
