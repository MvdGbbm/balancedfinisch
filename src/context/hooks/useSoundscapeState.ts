
import { useState } from "react";
import { Soundscape } from "@/lib/types";

export function useSoundscapeState() {
  // This is a stub file to prevent import errors
  // All Soundscape functionality has been removed
  const [soundscapes, setSoundscapes] = useState<Soundscape[]>([]);
  const [currentSoundscape, setCurrentSoundscape] = useState<Soundscape | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addSoundscape = () => {};
  const updateSoundscape = () => {};
  const deleteSoundscape = () => {};

  return {
    soundscapes,
    currentSoundscape,
    isLoading,
    addSoundscape,
    updateSoundscape,
    deleteSoundscape,
    setSoundscapes,
    setCurrentSoundscape,
  };
}
