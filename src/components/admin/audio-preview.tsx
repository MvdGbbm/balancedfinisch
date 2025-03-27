
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Progress } from "@/components/ui/progress"; 
import { toast } from "sonner";

interface AudioPreviewProps {
  audioUrl: string;
  label: string;
}

export function AudioPreview({ audioUrl, label }: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error("Failed to play audio:", err);
        setError(true);
        toast.error("Kon audio niet afspelen");
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
    setError(false);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleError = () => {
    setError(true);
    setIsPlaying(false);
    toast.error(`Kon audio niet laden: ${label}`);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="p-3 border rounded-md bg-card mb-2">
      <audio
        ref={audioRef}
        src={audioUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
        preload="metadata"
      />
      
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-sm truncate flex-1">{label}</span>
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>

            <Button
              onClick={handlePlayPause}
              variant="outline"
              size="sm"
              disabled={error}
              className="h-8"
            >
              {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {isPlaying ? "Pauze" : "Afspelen"}
            </Button>
          </div>
        </div>

        <div className="w-full flex items-center gap-2 text-xs">
          <span>{formatTime(currentTime)}</span>
          <Progress value={progress} className="h-2 flex-1" />
          <span>{error ? "--:--" : formatTime(duration)}</span>
        </div>

        {error && (
          <p className="text-xs text-red-500 mt-1">
            Fout bij het laden van audio
          </p>
        )}
      </div>
    </div>
  );
}
