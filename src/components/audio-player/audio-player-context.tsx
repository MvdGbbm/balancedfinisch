
import { createContext, useContext, ReactNode } from "react";
import { Soundscape } from "@/lib/types";

interface AudioPlayerContextProps {
  currentTrack: Soundscape | null;
  isTrackPlaying: boolean;
  musicTracks: Soundscape[];
  selectedMusic: string;
  handleMusicChange: (value: string) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextProps | undefined>(undefined);

export function AudioPlayerProvider({ 
  children,
  currentTrack,
  isTrackPlaying,
  musicTracks,
  selectedMusic,
  handleMusicChange
}: AudioPlayerContextProps & { children: ReactNode }) {
  return (
    <AudioPlayerContext.Provider value={{
      currentTrack,
      isTrackPlaying,
      musicTracks,
      selectedMusic,
      handleMusicChange
    }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayerContext() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayerContext must be used within an AudioPlayerProvider');
  }
  return context;
}
