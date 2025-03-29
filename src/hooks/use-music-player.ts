
import { useState, useRef, useEffect } from "react";
import { Soundscape } from "@/lib/types";
import { useToast } from "./use-toast";

export function useMusicPlayer() {
  const { toast } = useToast();
  const [currentTrack, setCurrentTrack] = useState<Soundscape | null>(null);
  const [previewTrack, setPreviewTrack] = useState<Soundscape | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const handlePreviewTrack = (track: Soundscape) => {
    if (previewTrack?.id === track.id && isPlaying) {
      setPreviewTrack(null);
      setIsPlaying(false);
      
      toast({
        title: "Voorluisteren gestopt",
        description: `${track.title} is gestopt met afspelen`
      });
      return;
    }
    
    setPreviewTrack(track);
    setIsPlaying(true);
  };

  const handleStopPreview = () => {
    setPreviewTrack(null);
    setIsPlaying(false);
    
    toast({
      title: "Voorluisteren gestopt",
      description: "De muziek is gestopt"
    });
  };

  // Current playing track (either preview or playlist track)
  const currentPlayingTrack = previewTrack || currentTrack;

  return {
    currentTrack,
    setCurrentTrack,
    previewTrack,
    setPreviewTrack,
    isPlaying,
    setIsPlaying,
    audioPlayerRef,
    handlePreviewTrack,
    handleStopPreview,
    currentPlayingTrack
  };
}
