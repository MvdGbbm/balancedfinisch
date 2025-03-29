
import { useState, useRef, useEffect } from "react";
import { Soundscape } from "@/lib/types";
import { useToast } from "./use-toast";
import { toast } from "sonner";

export function useMusicPlayer() {
  const { toast: toastApi } = useToast();
  const [currentTrack, setCurrentTrack] = useState<Soundscape | null>(null);
  const [previewTrack, setPreviewTrack] = useState<Soundscape | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handlePreviewTrack = (track: Soundscape) => {
    // If trying to play same track that's already playing, stop it
    if (previewTrack?.id === track.id && isPlaying) {
      handleStopPreview();
      return;
    }
    
    // If another track is playing, stop it first
    if (isPlaying) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      }
    }
    
    // Clean up any existing audio context
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    
    setPreviewTrack(track);
    setIsPlaying(true);
    
    // Use sonner toast instead of the shadcn/ui toast
    toast("Voorluisteren gestart", {
      description: `${track.title} wordt afgespeeld`
    });
  };

  const handleStopPreview = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.src = '';
    }
    
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    
    setPreviewTrack(null);
    setIsPlaying(false);
    
    // Use sonner toast instead of the shadcn/ui toast
    toast("Voorluisteren gestopt", {
      description: "De muziek is gestopt"
    });
  };

  // Current playing track (either preview or playlist track)
  const currentPlayingTrack = previewTrack || currentTrack;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
    };
  }, []);

  return {
    currentTrack,
    setCurrentTrack,
    previewTrack,
    setPreviewTrack,
    isPlaying,
    setIsPlaying,
    audioPlayerRef,
    audioContextRef,
    handlePreviewTrack,
    handleStopPreview,
    currentPlayingTrack
  };
}
