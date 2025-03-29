
import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Soundscape } from "@/lib/types";

interface AudioPlayerContextType {
  currentTrack: Soundscape;
  setCurrentTrack: React.Dispatch<React.SetStateAction<Soundscape>>;
  previewTrack: Soundscape;
  setPreviewTrack: React.Dispatch<React.SetStateAction<Soundscape>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  audioRef: React.RefObject<HTMLAudioElement>;
  currentPlayingTrack: Soundscape;
}

const defaultSoundscape: Soundscape = {
  id: "",
  title: "",
  audioUrl: "",
  category: "",
  coverImageUrl: "",
  description: "",
  tags: []
};

const AudioPlayerContext = createContext<AudioPlayerContextType>({
  currentTrack: defaultSoundscape,
  setCurrentTrack: () => {},
  previewTrack: defaultSoundscape,
  setPreviewTrack: () => {},
  isPlaying: false,
  setIsPlaying: () => {},
  volume: 1,
  setVolume: () => {},
  audioRef: { current: null },
  currentPlayingTrack: defaultSoundscape
});

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Soundscape>(defaultSoundscape);
  const [previewTrack, setPreviewTrack] = useState<Soundscape>(defaultSoundscape);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // The track that is actually playing (could be either main track or preview)
  const currentPlayingTrack = previewTrack.id ? previewTrack : currentTrack;

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        setCurrentTrack,
        previewTrack,
        setPreviewTrack,
        isPlaying,
        setIsPlaying,
        volume,
        setVolume,
        audioRef,
        currentPlayingTrack
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => useContext(AudioPlayerContext);
