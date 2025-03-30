
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AudioPreviewProps {
  url: string;
  label?: string;
  showControls?: boolean;
  autoPlay?: boolean;
  onEnded?: () => void;
}

export const AudioPreview: React.FC<AudioPreviewProps> = ({
  url,
  label,
  showControls = true,
  autoPlay = false,
  onEnded
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset state when URL changes
  useEffect(() => {
    setError(false);
    setLoaded(false);
    setProgress(0);
    setIsPlaying(false);
  }, [url]);

  // Auto-play when requested and URL is valid
  useEffect(() => {
    if (audioRef.current && autoPlay && url && !error) {
      try {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.error("Error auto-playing audio:", err);
            setError(true);
          });
      } catch (err) {
        console.error("Error playing audio:", err);
        setError(true);
      }
    }
  }, [autoPlay, url, error]);

  // Update progress during playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const calculatedProgress = (audio.currentTime / audio.duration) * 100;
      setProgress(isNaN(calculatedProgress) ? 0 : calculatedProgress);
    };

    const handleLoadedData = () => {
      setLoaded(true);
      setError(false);
    };

    const handleError = () => {
      console.error("Error loading audio:", url);
      setError(true);
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      if (onEnded) onEnded();
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [url, onEnded]);

  // Apply volume settings
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  const togglePlay = () => {
    if (!audioRef.current || !url) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error("Error playing audio:", err);
          setError(true);
        });
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const handleVolumeChange = (values: number[]) => {
    setVolume(values[0]);
    if (values[0] > 0 && muted) {
      setMuted(false);
    }
  };

  // Extract filename from URL for better display
  const getFileNameFromUrl = (url: string): string => {
    if (!url) return "";
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/');
      return pathSegments[pathSegments.length - 1] || url;
    } catch {
      // If URL parsing fails, try to get the last segment
      const segments = url.split('/');
      return segments[segments.length - 1] || url;
    }
  };

  const displayUrl = label || getFileNameFromUrl(url);

  if (!url) {
    return (
      <div className="text-sm text-muted-foreground p-2 italic">
        Geen URL opgegeven
      </div>
    );
  }

  return (
    <div className="p-2 rounded-md bg-muted/20 space-y-2 border border-border/50">
      <audio ref={audioRef} src={url} preload="metadata" />

      {error ? (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Kon audio niet laden. Controleer de URL.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="text-sm font-medium truncate" title={url}>
            {displayUrl}
          </div>

          {loaded && showControls && (
            <>
              <Progress value={progress} className="h-1 w-full" />

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={togglePlay}
                  disabled={error}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleMute}
                  >
                    {muted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Slider
                    className="w-20"
                    value={[volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                  />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
