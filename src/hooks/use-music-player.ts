
import { useState, useRef, useEffect } from "react";
import { Soundscape } from "@/lib/types";
import { useToast } from "./use-toast";
import { toast } from "sonner";

export function useMusicPlayer() {
  const { toast: uiToast } = useToast();
  const [currentTrack, setCurrentTrack] = useState<Soundscape | null>(null);
  const [previewTrack, setPreviewTrack] = useState<Soundscape | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Ensure audio element is properly initialized
  useEffect(() => {
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio();
      audioPlayerRef.current.preload = "auto";
      
      // Add error handler
      audioPlayerRef.current.addEventListener('error', (e) => {
        console.error('Audio element error:', e);
        toast.error("Er is een fout opgetreden bij het afspelen van de audio.");
      });
    }
    
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      }
    };
  }, []);

  // Update audio source when current track changes
  useEffect(() => {
    const track = previewTrack || currentTrack;
    
    if (track && isPlaying && audioPlayerRef.current) {
      console.log(`Setting audio source to: ${track.audioUrl}`);
      audioPlayerRef.current.src = track.audioUrl;
      
      const playPromise = audioPlayerRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing track:', error);
          toast.error("Kon de track niet afspelen. Probeer het opnieuw.");
        });
      }
    }
  }, [currentTrack, previewTrack, isPlaying]);

  const handlePreviewTrack = (track: Soundscape) => {
    if (previewTrack?.id === track.id && isPlaying) {
      setPreviewTrack(null);
      setIsPlaying(false);
      
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      
      uiToast({
        title: "Voorluisteren gestopt",
        description: `${track.title} is gestopt met afspelen`
      });
      return;
    }
    
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    
    setPreviewTrack(track);
    setIsPlaying(true);
    
    uiToast({
      title: "Voorluisteren",
      description: `${track.title} wordt afgespeeld`
    });
  };

  const handleStopPreview = () => {
    setPreviewTrack(null);
    setIsPlaying(false);
    
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    
    uiToast({
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
