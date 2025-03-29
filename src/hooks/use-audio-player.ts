
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAudioPlayerProps {
  audioUrl: string;
  isPlayingExternal?: boolean;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  onError?: () => void;
  volume?: number;
  nextAudioUrl?: string;
  onEnded?: () => void;
  onCrossfadeStart?: () => void;
  title?: string;
}

export function useAudioPlayer({
  audioUrl,
  isPlayingExternal,
  onPlayPauseChange,
  onError,
  volume: externalVolume,
  nextAudioUrl,
  onEnded,
  onCrossfadeStart,
  title
}: UseAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(externalVolume !== undefined ? externalVolume : 0.7);
  const [loadError, setLoadError] = useState(false);
  const isUserInteracting = useRef(false);
  const crossfadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  
  console.log(`useAudioPlayer initialized with URL: ${audioUrl}`);

  // Handle when isPlayingExternal prop changes
  useEffect(() => {
    console.log(`External playing state changed to: ${isPlayingExternal}`);
    
    if (isPlayingExternal !== undefined) {
      if (isPlayingExternal && audioRef.current) {
        // Attempt to play
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error auto-playing audio:', error);
            if (error.name === 'NotAllowedError') {
              toast.info("Autoplay is geblokkeerd door je browser. Klik op afspelen om te starten.");
            }
            // Update internal state
            setIsPlaying(false);
            if (onPlayPauseChange) onPlayPauseChange(false);
          });
        }
      } else if (!isPlayingExternal && audioRef.current) {
        audioRef.current.pause();
      }
      
      // Update internal state to match external state
      setIsPlaying(!!isPlayingExternal);
    }
  }, [isPlayingExternal, onPlayPauseChange]);

  // Handle audio element initialization and cleanup
  useEffect(() => {
    if (!audioRef.current && typeof window !== 'undefined') {
      audioRef.current = new Audio();
    }
    
    // Create and configure next audio element for crossfading
    if (!nextAudioRef.current && typeof window !== 'undefined' && nextAudioUrl) {
      nextAudioRef.current = new Audio();
    }
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current);
      }
    };
  }, [nextAudioUrl]);

  // Set up audio element event listeners
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoadError(false);
      console.log(`Audio metadata loaded. Duration: ${audio.duration}s`);
    };
    
    const handleTimeUpdate = () => {
      if (!isUserInteracting.current) {
        setCurrentTime(audio.currentTime);
      }
      
      // Setup crossfade if needed
      if (nextAudioUrl && onCrossfadeStart && !crossfadeTimeoutRef.current) {
        const timeLeft = audio.duration - audio.currentTime;
        
        if (timeLeft <= 10 && timeLeft > 9) {
          console.log('Setting up crossfade for end of track');
          crossfadeTimeoutRef.current = setTimeout(() => {
            if (nextAudioRef.current && nextAudioUrl) {
              console.log('Starting crossfade to next track');
              nextAudioRef.current.src = nextAudioUrl;
              nextAudioRef.current.volume = 0;
              
              const playPromise = nextAudioRef.current.play();
              if (playPromise !== undefined) {
                playPromise.then(() => {
                  console.log('Next track playing, crossfading');
                  if (onCrossfadeStart) onCrossfadeStart();
                  
                  // Fade out current track and fade in next track
                  let vol = 1;
                  const fadeInterval = setInterval(() => {
                    vol -= 0.1;
                    if (vol < 0) vol = 0;
                    
                    if (audioRef.current) audioRef.current.volume = vol * volume;
                    if (nextAudioRef.current) nextAudioRef.current.volume = (1 - vol) * volume;
                    
                    if (vol <= 0) {
                      clearInterval(fadeInterval);
                    }
                  }, 100);
                }).catch(error => {
                  console.error('Error starting crossfade:', error);
                });
              }
            }
          }, 8000);
        }
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      
      if (onPlayPauseChange) {
        onPlayPauseChange(false);
      }
      
      if (onEnded) {
        onEnded();
      }
      
      console.log('Audio playback ended');
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
      console.log('Audio is playing');
      
      if (!updateIntervalRef.current) {
        updateIntervalRef.current = setInterval(() => {
          if (audio && !isUserInteracting.current) {
            setCurrentTime(audio.currentTime);
          }
        }, 500);
      }
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      console.log('Audio is paused');
      
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
    
    const handleError = (e: Event) => {
      const error = (e.target as HTMLAudioElement).error;
      console.error('Audio error:', error?.message || 'Unknown error');
      setLoadError(true);
      setIsPlaying(false);
      
      if (onPlayPauseChange) {
        onPlayPauseChange(false);
      }
      
      if (onError) {
        onError();
      }
      
      if (error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
        toast.error(`Audio format niet ondersteund: ${title || audioUrl}`);
      } else if (error?.code === MediaError.MEDIA_ERR_NETWORK) {
        toast.error(`Netwerkfout bij laden audio: ${title || audioUrl}`);
      } else {
        toast.error(`Fout bij afspelen audio: ${title || audioUrl}`);
      }
    };
    
    // Set volume
    audio.volume = volume;

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    
    if (audioUrl) {
      // Only set src if it's different to avoid unnecessary reloads
      if (audio.src !== audioUrl) {
        console.log(`Setting audio source to: ${audioUrl}`);
        audio.src = audioUrl;
        audio.load();
      }
    }
    
    // Cleanup
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
      
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current);
        crossfadeTimeoutRef.current = null;
      }
    };
  }, [audioUrl, nextAudioUrl, onCrossfadeStart, onEnded, onError, onPlayPauseChange, title, volume]);

  // Sync volume with external volume prop
  useEffect(() => {
    if (externalVolume !== undefined && externalVolume !== volume) {
      setVolume(externalVolume);
      if (audioRef.current) {
        audioRef.current.volume = externalVolume;
      }
    }
  }, [externalVolume, volume]);

  // Handle play/pause toggle
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Attempt to play
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error on manual play:', error);
          if (error.name === 'NotAllowedError') {
            toast.info("Autoplay is geblokkeerd. Herlaad de pagina en probeer opnieuw.");
          } else {
            toast.error("Kon audio niet afspelen. Probeer het opnieuw.");
          }
          setIsPlaying(false);
          if (onPlayPauseChange) onPlayPauseChange(false);
        });
      }
    }
    
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    
    if (onPlayPauseChange) {
      onPlayPauseChange(newIsPlaying);
    }
  }, [isPlaying, onPlayPauseChange]);

  // Handle volume change
  const handleVolumeChange = useCallback((values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    
    if (nextAudioRef.current) {
      nextAudioRef.current.volume = newVolume;
    }
  }, []);

  // Retry loading after an error
  const handleRetry = useCallback(() => {
    if (!audioRef.current || !audioUrl) return;
    
    console.log('Retrying audio load:', audioUrl);
    setLoadError(false);
    
    audioRef.current.src = audioUrl;
    audioRef.current.load();
    
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setIsPlaying(true);
        if (onPlayPauseChange) onPlayPauseChange(true);
      }).catch(error => {
        console.error('Error retrying audio play:', error);
        setIsPlaying(false);
        if (onPlayPauseChange) onPlayPauseChange(false);
      });
    }
  }, [audioUrl, onPlayPauseChange]);

  // Get duration in formatted string
  const formatTime = useCallback((time: number) => {
    if (!time) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    audioRef,
    isPlaying,
    duration,
    currentTime,
    volume,
    formatTime,
    togglePlay,
    handleVolumeChange,
    loadError,
    handleRetry
  };
}
