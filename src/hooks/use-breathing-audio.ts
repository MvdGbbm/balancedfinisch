
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Soundscape } from "@/lib/types";

type UseBreathingAudioProps = {
  soundscapes: Soundscape[];
  musicVolume: number;
};

export function useBreathingAudio({ soundscapes, musicVolume }: UseBreathingAudioProps) {
  const startAudioRef = useRef<HTMLAudioElement | null>(null);
  const endAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  
  const [musicTracks, setMusicTracks] = useState<Soundscape[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Soundscape | null>(null);
  const [isTrackPlaying, setIsTrackPlaying] = useState(false);

  useEffect(() => {
    const filteredTracks = soundscapes.filter(
      soundscape => soundscape.category === "Muziek"
    );
    setMusicTracks(filteredTracks);
  }, [soundscapes]);

  useEffect(() => {
    // Update audio volume when musicVolume changes
    if (audioPlayerRef.current) {
      audioPlayerRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

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
    startAudioRef,
    endAudioRef,
    audioPlayerRef,
    musicTracks,
    currentTrack,
    isTrackPlaying,
    setIsTrackPlaying,
    handlePlayTrack
  };
}
