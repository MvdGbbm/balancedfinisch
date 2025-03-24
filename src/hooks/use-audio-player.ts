
import { useState, useEffect, useRef } from "react";
import { MusicItem } from "@/lib/types";
import { formatTime } from "@/utils/audioUtils";

interface AudioPlayerState {
  currentTrack: MusicItem | null;
  playlist: MusicItem[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
  formattedCurrentTime: string;
  formattedDuration: string;
  progress: number;
}

interface AudioPlayerControls {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  playTrack: (track: MusicItem) => void;
  setPlaylist: (tracks: MusicItem[], startWithTrack?: MusicItem) => void;
  getAudioElement: () => HTMLAudioElement | null;
}

export const useAudioPlayer = (): [AudioPlayerState, AudioPlayerControls] => {
  const [currentTrack, setCurrentTrack] = useState<MusicItem | null>(null);
  const [playlist, setPlaylistState] = useState<MusicItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Set initial volume
      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Handle track changes
  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;
    
    const audio = audioRef.current;
    
    // Reset state
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
    setError(null);
    
    // Update audio source
    audio.src = currentTrack.audioUrl;
    audio.load();
    
    // Auto-play when track changes
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Playback failed:", err);
          setIsPlaying(false);
          setError("Failed to play audio");
        });
    }
    
    // Event listeners for audio
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const onEnded = () => {
      setIsPlaying(false);
      next();
    };
    
    const onError = () => {
      setIsLoading(false);
      setError("Error loading audio");
      setIsPlaying(false);
    };
    
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    
    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [currentTrack]);
  
  // Handle play state changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.error("Playback failed:", err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);
  
  // Handle volume changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);
  
  // Play/pause controls
  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const toggle = () => setIsPlaying(!isPlaying);
  
  // Seek control
  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };
  
  // Volume control
  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    
    if (isMuted && clampedVolume > 0) {
      setIsMuted(false);
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // Track navigation
  const next = () => {
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentTrack(playlist[nextIndex]);
  };
  
  const previous = () => {
    if (!currentTrack || playlist.length === 0) return;
    
    // If current time is more than 3 seconds, restart the track instead
    if (currentTime > 3) {
      seek(0);
      return;
    }
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentTrack(playlist[prevIndex]);
  };
  
  // Play specific track
  const playTrack = (track: MusicItem) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };
  
  // Set playlist
  const setPlaylist = (tracks: MusicItem[], startWithTrack?: MusicItem) => {
    setPlaylistState(tracks);
    
    if (startWithTrack) {
      setCurrentTrack(startWithTrack);
    } else if (tracks.length > 0 && (!currentTrack || !tracks.some(t => t.id === currentTrack.id))) {
      setCurrentTrack(tracks[0]);
    }
  };
  
  // Get audio element (for advanced usage like visualizer)
  const getAudioElement = () => audioRef.current;
  
  // Calculate derived values
  const formattedCurrentTime = formatTime(currentTime);
  const formattedDuration = formatTime(duration);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return [
    {
      currentTrack,
      playlist,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      isLoading,
      error,
      formattedCurrentTime,
      formattedDuration,
      progress,
    },
    {
      play,
      pause,
      toggle,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      playTrack,
      setPlaylist,
      getAudioElement,
    },
  ];
};
