
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Soundscape } from "@/lib/types";
import { useApp } from "@/context/AppContext";

export function useBreathingMusic() {
  const { soundscapes } = useApp();
  const [musicTracks, setMusicTracks] = useState<Soundscape[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Soundscape | null>(null);
  const [isTrackPlaying, setIsTrackPlaying] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  
  // Filter music tracks - using useEffect with dependency
  useEffect(() => {
    const filteredTracks = soundscapes.filter(
      soundscape => soundscape.category === "Muziek"
    );
    setMusicTracks(filteredTracks);
  }, [soundscapes]);

  // Memoize the play track handler to prevent unnecessary re-renders
  const handlePlayTrack = useCallback((track: Soundscape) => {
    if (currentTrack?.id === track.id && isTrackPlaying) {
      setIsTrackPlaying(false);
      setCurrentTrack(null);
      
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      
      toast.info(`${track.title} is gestopt met afspelen`);
      return;
    }
    
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    
    setCurrentTrack(track);
    setIsTrackPlaying(true);
    toast.success(`Nu afspelend: ${track.title}`);
  }, [currentTrack, isTrackPlaying]);

  return {
    musicTracks,
    currentTrack,
    isTrackPlaying,
    audioPlayerRef,
    handlePlayTrack,
    setIsTrackPlaying
  };
}
