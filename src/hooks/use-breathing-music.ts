
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Soundscape } from "@/lib/types";
import { useApp } from "@/context/AppContext";

export function useBreathingMusic() {
  const { soundscapes } = useApp();
  const [musicTracks, setMusicTracks] = useState<Soundscape[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Soundscape | null>(null);
  const [isTrackPlaying, setIsTrackPlaying] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  
  // Filter music tracks
  useEffect(() => {
    const filteredTracks = soundscapes.filter(
      soundscape => soundscape.category === "Muziek"
    );
    setMusicTracks(filteredTracks);
  }, [soundscapes]);

  const handlePlayTrack = (track: Soundscape) => {
    if (currentTrack?.id === track.id && isTrackPlaying) {
      setIsTrackPlaying(false);
      setCurrentTrack(null);
      toast.info(`${track.title} is gestopt met afspelen`);
      return;
    }
    
    setCurrentTrack(track);
    setIsTrackPlaying(true);
    toast.success(`Nu afspelend: ${track.title}`);
  };

  return {
    musicTracks,
    currentTrack,
    isTrackPlaying,
    audioPlayerRef,
    handlePlayTrack,
    setIsTrackPlaying
  };
}
