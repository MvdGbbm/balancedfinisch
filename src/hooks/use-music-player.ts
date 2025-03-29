
import { useState, useRef, useEffect, useCallback } from "react";
import { Soundscape } from "@/lib/types";
import { useToast } from "./use-toast";
import { toast } from "sonner";

export function useMusicPlayer() {
  const { toast: uiToast } = useToast();
  const [currentTrack, setCurrentTrack] = useState<Soundscape | null>(null);
  const [previewTrack, setPreviewTrack] = useState<Soundscape | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const audioInitialized = useRef(false);

  // Ensure audio element is properly initialized
  useEffect(() => {
    if (!audioPlayerRef.current && typeof window !== 'undefined') {
      audioPlayerRef.current = new Audio();
      audioPlayerRef.current.preload = "auto";
      
      // Add error handler
      const handleError = (e: ErrorEvent) => {
        console.error('Audio element error:', e);
        toast.error("Er is een fout opgetreden bij het afspelen van de audio.");
        setIsPlaying(false);
      };
      
      audioPlayerRef.current.addEventListener('error', handleError as EventListener);
      audioInitialized.current = true;
      
      console.log('Audio player initialized');
    }
    
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
        audioPlayerRef.current = null;
        audioInitialized.current = false;
      }
    };
  }, []);

  // Play audio function
  const playAudio = useCallback((url: string) => {
    if (!audioPlayerRef.current) return;
    
    try {
      audioPlayerRef.current.src = url;
      audioPlayerRef.current.load();
      
      const playPromise = audioPlayerRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing track:', error);
          toast.error("Kon de track niet afspelen. Probeer het opnieuw.");
          setIsPlaying(false);
        });
      }
    } catch (error) {
      console.error('Error setting up audio playback:', error);
      toast.error("Kon de audio niet laden. Probeer het opnieuw.");
      setIsPlaying(false);
    }
  }, []);

  // Update audio source when current track changes
  useEffect(() => {
    const track = previewTrack || currentTrack;
    
    if (track && isPlaying && audioPlayerRef.current) {
      console.log(`Setting audio source to: ${track.audioUrl}`);
      playAudio(track.audioUrl);
    } else if (!isPlaying && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
  }, [currentTrack, previewTrack, isPlaying, playAudio]);

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
    currentPlayingTrack,
    playAudio
  };
}
