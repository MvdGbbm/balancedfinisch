import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";
import { ErrorMessage } from "./error-message";
import { validateAudioUrl, preloadAudio, fixSupabaseStorageUrl, getAudioMimeType } from "./utils";
import { useToast } from "@/hooks/use-toast";

interface AudioPreviewProps {
  url: string;
  label?: string;
  showControls?: boolean;
  autoPlay?: boolean;
  onEnded?: () => void;
  onError?: () => void;
  onLoaded?: () => void;
}

export const AudioPreview: React.FC<AudioPreviewProps> = ({
  url,
  label,
  showControls = true,
  autoPlay = false,
  onEnded,
  onError,
  onLoaded
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [validatedUrl, setValidatedUrl] = useState("");
  const { toast } = useToast();
  const maxRetries = 2;
  const [retryCount, setRetryCount] = useState(0);

  // Set validated URL when the URL changes
  useEffect(() => {
    if (!url) {
      setError(true);
      setIsValidUrl(false);
      console.warn("Empty URL provided to AudioPreview");
      return;
    }

    const originalUrl = url;
    let fixedUrl = validateAudioUrl(url);
    
    // Handle Supabase storage URLs
    if (fixedUrl && fixedUrl.includes('supabase.co')) {
      fixedUrl = fixSupabaseStorageUrl(fixedUrl);
    }
    
    setValidatedUrl(fixedUrl || '');
    setIsValidUrl(!!fixedUrl && (fixedUrl === originalUrl || fixedUrl === url));
    
    // Reset states when URL changes
    setError(false);
    setLoaded(false);
    setProgress(0);
    setIsPlaying(false);
    setRetryCount(0);
    
    console.log("Audio URL processed:", {
      original: url,
      validated: fixedUrl,
      isValid: !!fixedUrl
    });
    
    // Pre-validate audio URL
    if (fixedUrl) {
      preloadAudio(fixedUrl).then(success => {
        if (!success && !error) {
          console.warn("Audio preload check failed:", fixedUrl);
          setError(true);
          if (onError) onError();
        } else if (success) {
          console.log("Audio preload succeeded:", fixedUrl);
        }
      });
    } else {
      setError(true);
      if (onError) onError();
    }
  }, [url, onError, error]);

  // Auto-play when requested and URL is valid
  useEffect(() => {
    if (audioRef.current && autoPlay && validatedUrl && !error) {
      try {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.error("Error auto-playing audio:", err);
            setError(true);
            if (onError) onError();
          });
      } catch (err) {
        console.error("Error playing audio:", err);
        setError(true);
        if (onError) onError();
      }
    }
  }, [autoPlay, validatedUrl, error, onError]);

  // Update progress during playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const calculatedProgress = (audio.currentTime / audio.duration) * 100;
      setProgress(isNaN(calculatedProgress) ? 0 : calculatedProgress);
    };

    const handleLoadedData = () => {
      console.log("Audio loaded successfully:", validatedUrl);
      setLoaded(true);
      setError(false);
      if (onLoaded) onLoaded();
    };

    const handleError = (e: Event) => {
      console.error("Error loading audio:", validatedUrl, e);
      setError(true);
      setIsPlaying(false);
      
      if (retryCount < maxRetries) {
        // Auto-retry once
        console.log(`Auto-retrying (${retryCount + 1}/${maxRetries})...`);
        setRetryCount(prev => prev + 1);
        
        setTimeout(() => {
          if (audio) {
            // Try with a different approach
            if (validatedUrl.includes('supabase.co')) {
              const correctedUrl = fixSupabaseStorageUrl(validatedUrl);
              if (correctedUrl !== validatedUrl) {
                console.log("Trying with corrected Supabase URL:", correctedUrl);
                audio.src = correctedUrl;
                setValidatedUrl(correctedUrl);
              } else {
                audio.load();
              }
            } else {
              audio.load();
            }
          }
        }, 1000);
      } else if (onError) {
        onError();
      }
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
    
    // Add additional event listeners for troubleshooting
    audio.addEventListener("stalled", () => {
      console.warn("Audio playback stalled:", validatedUrl);
    });
    
    audio.addEventListener("waiting", () => {
      console.log("Audio waiting for data:", validatedUrl);
    });
    
    audio.addEventListener("canplay", () => {
      console.log("Audio can play:", validatedUrl);
    });

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("stalled", () => {});
      audio.removeEventListener("waiting", () => {});
      audio.removeEventListener("canplay", () => {});
    };
  }, [validatedUrl, onEnded, onError, onLoaded, retryCount, maxRetries]);

  // Apply volume settings
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  const togglePlay = () => {
    if (!audioRef.current || !validatedUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setError(false); // Reset error on manual play attempt
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error("Error playing audio:", err);
          setError(true);
          if (onError) onError();
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

  const handleRetry = () => {
    if (!audioRef.current || !validatedUrl) return;
    
    setIsRetrying(true);
    setError(false);
    
    // Check if it's a Supabase URL and fix it if needed
    let retryUrl = validatedUrl;
    if (validatedUrl.includes('supabase.co')) {
      retryUrl = fixSupabaseStorageUrl(validatedUrl);
      if (retryUrl !== validatedUrl) {
        console.log("Retrying with fixed Supabase URL:", retryUrl);
        setValidatedUrl(retryUrl);
      }
    }
    
    // Force reload the audio
    const audio = audioRef.current;
    audio.src = retryUrl;
    audio.load();
    
    audio.oncanplaythrough = () => {
      setIsRetrying(false);
      audio.play()
        .then(() => {
          setIsPlaying(true);
          toast({
            title: "Audio hersteld",
            description: "De audio speelt nu af."
          });
        })
        .catch(err => {
          console.error("Error retrying audio play:", err);
          setError(true);
          setIsRetrying(false);
          if (onError) onError();
          toast({
            variant: "destructive",
            title: "Fout bij afspelen",
            description: "Audio kon niet worden afgespeeld. Controleer de URL."
          });
        });
    };
    
    audio.onerror = () => {
      setError(true);
      setIsRetrying(false);
      if (onError) onError();
      toast({
        variant: "destructive",
        title: "Fout bij laden",
        description: "Audio kon niet worden geladen. Controleer de URL."
      });
    };
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

  const displayUrl = label || getFileNameFromUrl(validatedUrl || url);

  if (!url) {
    return (
      <div className="text-sm text-muted-foreground p-2 italic">
        Geen URL opgegeven
      </div>
    );
  }

  return (
    <div className="p-2 rounded-md bg-muted/20 space-y-2 border border-border/50">
      <audio 
        ref={audioRef} 
        preload="metadata" 
        src={validatedUrl}
      >
        <source src={validatedUrl} type={getAudioMimeType(validatedUrl)} />
        Your browser does not support the audio element.
      </audio>

      {error ? (
        <ErrorMessage 
          handleRetry={handleRetry} 
          isRetrying={isRetrying} 
          message={!isValidUrl ? "Ongeldige URL. Controleer het formaat." : "Kan audio niet laden. Controleer de URL."}
        />
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
