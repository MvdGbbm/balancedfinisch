
import { useState, useEffect, useRef } from "react";
import { Soundscape } from "@/lib/types";
import { toast } from "sonner";

export function useMusicPreview() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handlePreviewToggle = (track: Soundscape) => {
    if (previewUrl === track.audioUrl && isPlaying) {
      stopPreview();
    } else {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
      }
      
      // Clean up any existing audio context
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
      
      setPreviewUrl(track.audioUrl);
      setIsPlaying(true);
    }
  };

  const stopPreview = () => {
    setIsPlaying(false);
    setPreviewUrl(null);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && previewUrl) {
        audioRef.current.src = previewUrl;
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
          toast.error("Kon audio niet afspelen");
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, previewUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
    };
  }, []);

  return {
    previewUrl,
    isPlaying,
    audioRef,
    audioContextRef,
    handlePreviewToggle,
    stopPreview
  };
}
