
import { useState, useRef } from "react";

interface UseAudioStateProps {
  initialVolume?: number;
}

export const useAudioState = ({ initialVolume }: UseAudioStateProps = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(initialVolume ?? 0.8);
  const [isLooping, setIsLooping] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const [isLiveStream, setIsLiveStream] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const crossfadeTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  
  return {
    // State
    isPlaying, setIsPlaying,
    duration, setDuration,
    currentTime, setCurrentTime,
    volume, setVolume, 
    isLooping, setIsLooping,
    isLoaded, setIsLoaded,
    loadError, setLoadError,
    isRetrying, setIsRetrying,
    isCrossfading, setIsCrossfading,
    isLiveStream, setIsLiveStream,
    
    // Refs
    audioRef,
    nextAudioRef,
    crossfadeTimeoutRef,
    retryCountRef
  };
};
