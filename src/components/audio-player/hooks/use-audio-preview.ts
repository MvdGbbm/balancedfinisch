
import { useState, useEffect, useRef } from "react";
import { validateAudioUrl, preloadAudio, fixSupabaseStorageUrl, getAudioMimeType } from "@/components/audio-player/utils";

interface UseAudioPreviewProps {
  url: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  onError?: () => void;
  onLoaded?: () => void;
}

export function useAudioPreview({
  url,
  autoPlay = false,
  onEnded,
  onError,
  onLoaded
}: UseAudioPreviewProps) {
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
  const maxRetries = 2;
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (url) {
      const originalUrl = url;
      let fixedUrl = validateAudioUrl(url);
      if (!fixedUrl) {
        setIsValidUrl(false);
        setError(true);
        if (onError) onError();
        return;
      }
      
      if (fixedUrl.includes('supabase.co')) {
        fixedUrl = fixSupabaseStorageUrl(fixedUrl);
      }
      
      setValidatedUrl(fixedUrl);
      setIsValidUrl(!!fixedUrl && (fixedUrl === originalUrl || fixedUrl === url));
      
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
      
      preloadAudio(fixedUrl).then((success) => {
        if (!success && !error) {
          console.warn("Audio preload check failed:", fixedUrl);
          setError(true);
          if (onError) onError();
        } else if (success) {
          console.log("Audio preload succeeded:", fixedUrl);
        }
      }).catch(() => {
        setError(true);
        if (onError) onError();
      });
    }
  }, [url, onError, error]);

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
        setRetryCount(prev => prev + 1);
        
        setTimeout(() => {
          if (audio) {
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
      setError(false);
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
    
    let retryUrl = validatedUrl;
    if (validatedUrl.includes('supabase.co')) {
      retryUrl = fixSupabaseStorageUrl(validatedUrl);
      if (retryUrl !== validatedUrl) {
        console.log("Retrying with fixed Supabase URL:", retryUrl);
        setValidatedUrl(retryUrl);
      }
    }
    
    const audio = audioRef.current;
    audio.src = retryUrl;
    audio.load();
    
    audio.oncanplaythrough = () => {
      setIsRetrying(false);
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error("Error retrying audio play:", err);
          setError(true);
          setIsRetrying(false);
          if (onError) onError();
        });
    };
    
    audio.onerror = () => {
      setError(true);
      setIsRetrying(false);
      if (onError) onError();
    };
  };
  
  const getFileNameFromUrl = (url: string): string => {
    if (!url) return "";
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/');
      return pathSegments[pathSegments.length - 1] || url;
    } catch {
      return url.split('/')[url.split('/').length - 1] || url;
    }
  };

  return {
    audioRef,
    isPlaying,
    progress,
    volume,
    muted,
    error,
    loaded,
    isRetrying,
    isValidUrl,
    validatedUrl,
    togglePlay,
    toggleMute,
    handleVolumeChange,
    handleRetry,
    getFileNameFromUrl
  };
}
