
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { validateAudioUrl } from "./utils";

interface AudioPreviewProps {
  audioUrl: string;
  className?: string;
  showDetails?: boolean;
}

export const AudioPreview: React.FC<AudioPreviewProps> = ({
  audioUrl,
  className = "",
  showDetails = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  // Update audio source if URL changes
  useEffect(() => {
    if (!audioUrl) return;
    
    const audio = audioRef.current;
    if (!audio) return;
    
    setIsLoading(true);
    setIsError(false);
    setIsPlaying(false);
    
    const processedUrl = validateAudioUrl(audioUrl);
    audio.src = processedUrl;
    
    const loadHandler = () => {
      setIsLoading(false);
      setDuration(audio.duration);
    };
    
    const errorHandler = () => {
      console.error("Error loading audio preview:", processedUrl);
      setIsLoading(false);
      setIsError(true);
      setIsPlaying(false);
      toast.error("Kon audio niet laden");
    };
    
    audio.addEventListener('loadedmetadata', loadHandler);
    audio.addEventListener('error', errorHandler);
    audio.load();
    
    return () => {
      audio.removeEventListener('loadedmetadata', loadHandler);
      audio.removeEventListener('error', errorHandler);
    };
  }, [audioUrl]);
  
  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Play error:", error);
            setIsError(true);
            toast.error("Kon audio niet afspelen");
          });
      }
    }
  };
  
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const reloadAudio = () => {
    if (!audioRef.current || !audioUrl) return;
    
    setIsLoading(true);
    setIsError(false);
    setIsPlaying(false);
    
    audioRef.current.pause();
    audioRef.current.src = validateAudioUrl(audioUrl);
    audioRef.current.load();
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        disabled={!audioUrl || isLoading || isError}
        onClick={togglePlayback}
      >
        {isLoading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      
      {showDetails && (
        <div className="text-xs text-muted-foreground">
          {isError ? (
            <div className="flex items-center gap-1">
              <span className="text-red-500">Fout</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-xs"
                onClick={reloadAudio}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          ) : isLoading ? (
            <span>Laden...</span>
          ) : (
            <span>{formatTime(duration)}</span>
          )}
        </div>
      )}
      
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
    </div>
  );
};
