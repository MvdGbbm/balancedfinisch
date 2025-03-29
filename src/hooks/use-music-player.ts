
import { useState, useRef, useEffect, useCallback } from "react";
import { Soundscape } from "@/lib/types";
import { useToast } from "./use-toast";
import { toast } from "sonner";
import { validateAudioUrl, preloadAudio } from "@/components/audio-player/utils";

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
      console.log('Creating new audio element');
      audioPlayerRef.current = new Audio();
      audioPlayerRef.current.preload = "auto";
      
      // Add error handler
      const handleError = (e: Event) => {
        console.error('Audio element error:', e);
        toast.error("Er is een fout opgetreden bij het afspelen van de audio.");
        setIsPlaying(false);
      };
      
      audioPlayerRef.current.addEventListener('error', handleError);
      
      // Add successful playback handler
      audioPlayerRef.current.addEventListener('playing', () => {
        console.log('Audio is now playing');
      });
      
      audioInitialized.current = true;
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
  const playAudio = useCallback(async (url: string) => {
    if (!audioPlayerRef.current) {
      console.error('Audio player reference is null');
      return;
    }
    
    console.log(`Attempting to play audio: ${url}`);
    
    // Validate URL
    const validatedUrl = validateAudioUrl(url);
    if (!validatedUrl) {
      console.error('Invalid audio URL:', url);
      toast.error("Ongeldige audio URL. Controleer de URL en probeer opnieuw.");
      setIsPlaying(false);
      return;
    }
    
    try {
      // Preload audio to check if it can be played
      console.log('Preloading audio...');
      const canPlay = await preloadAudio(validatedUrl);
      
      if (!canPlay) {
        console.error('Audio cannot be played:', validatedUrl);
        toast.error("Kon de audio niet laden. Controleer de URL.");
        setIsPlaying(false);
        return;
      }
      
      console.log('Audio preloaded successfully, starting playback');
      
      audioPlayerRef.current.src = validatedUrl;
      audioPlayerRef.current.load();
      
      const playPromise = audioPlayerRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('Playing audio successfully');
        }).catch(error => {
          console.error('Error playing track:', error);
          
          // Special handling for autoplay policy
          if (error.name === 'NotAllowedError') {
            toast.info("Autoplay is geblokkeerd. Klik nogmaals om audio af te spelen.");
          } else {
            toast.error("Kon de track niet afspelen. Probeer het opnieuw.");
          }
          
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
    
    if (track && isPlaying) {
      console.log(`Setting up playback for: ${track.title}`);
      playAudio(track.audioUrl);
    } else if (!isPlaying && audioPlayerRef.current) {
      console.log('Pausing audio');
      audioPlayerRef.current.pause();
    }
  }, [currentTrack, previewTrack, isPlaying, playAudio]);

  const handlePreviewTrack = (track: Soundscape) => {
    console.log('Preview track requested:', track);
    
    // If the same track is already playing, stop it
    if (previewTrack?.id === track.id && isPlaying) {
      setPreviewTrack(null);
      setIsPlaying(false);
      
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      }
      
      uiToast({
        title: "Voorluisteren gestopt",
        description: `${track.title} is gestopt met afspelen`
      });
      return;
    }
    
    // Stop any currently playing audio
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    
    // Start new preview
    setPreviewTrack(track);
    setIsPlaying(true);
    
    uiToast({
      title: "Voorluisteren",
      description: `${track.title} wordt afgespeeld`
    });
  };

  const handleStopPreview = () => {
    if (previewTrack) {
      console.log('Stopping preview for:', previewTrack.title);
    }
    
    setPreviewTrack(null);
    setIsPlaying(false);
    
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
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
