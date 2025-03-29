
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX } from "lucide-react";
import { validateAudioUrl } from "@/components/audio-player/utils";

interface BreathingAudioProps {
  audioUrl?: string;
  volume: number;
  onVolumeChange: (volume: number) => void;
  isPlaying: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
}

export const BreathingAudio: React.FC<BreathingAudioProps> = ({
  audioUrl,
  volume,
  onVolumeChange,
  isPlaying,
  isMuted,
  onMuteToggle
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !audioUrl) return;
    
    const processedUrl = validateAudioUrl(audioUrl);
    
    // Check if audio can be loaded
    const checkAudio = async () => {
      try {
        if (audioElement.src !== processedUrl) {
          audioElement.src = processedUrl;
          audioElement.load();
        }
      } catch (error) {
        console.error("Error loading breathing audio:", error);
        setIsError(true);
      }
    };
    
    checkAudio();
    
    // Event listeners
    const handleCanPlay = () => setIsLoaded(true);
    const handleError = () => setIsError(true);
    
    audioElement.addEventListener('canplay', handleCanPlay);
    audioElement.addEventListener('error', handleError);
    
    return () => {
      audioElement.removeEventListener('canplay', handleCanPlay);
      audioElement.removeEventListener('error', handleError);
      
      // Cleanup
      audioElement.pause();
      audioElement.src = '';
    };
  }, [audioUrl]);
  
  // Handle play/pause
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !isLoaded) return;
    
    if (isPlaying) {
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Audio play error:", error);
        });
      }
    } else {
      audioElement.pause();
    }
  }, [isPlaying, isLoaded]);
  
  // Handle volume changes
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    audioElement.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);
  
  // Create audio element
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMuteToggle}
        disabled={isError}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
      
      <Slider
        className="w-24"
        value={[isMuted ? 0 : volume]}
        max={1}
        step={0.01}
        onValueChange={(values) => onVolumeChange(values[0])}
        disabled={isError}
      />
      
      <audio ref={audioRef} loop>
        <source src={audioUrl ? validateAudioUrl(audioUrl) : ''} type="audio/mpeg" />
      </audio>
    </div>
  );
};
