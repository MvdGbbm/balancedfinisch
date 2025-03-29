
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { AudioControls } from "./audio-controls";
import { ProgressBar } from "./progress-bar";
import { NowPlaying } from "./now-playing";
import { MusicSelector } from "./music-selector";
import { Soundscape } from "@/lib/types";
import { validateAudioUrl } from "./utils";
import { toast } from "sonner";

export interface AudioPlayerProps {
  audioUrl?: string;
  soundscape?: Soundscape;
  coverImage?: string;
  title?: string;
  subtitle?: string;
  isPlayingExternal?: boolean;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  onError?: () => void;
  allowSoundscapeSelection?: boolean;
  onSoundscapeChange?: (soundscape: Soundscape) => void;
  selectedSoundscape?: Soundscape | null;
  availableSoundscapes?: Soundscape[];
}

export interface AudioPlayerHandle {
  play: () => void;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  seekTo: (time: number) => void;
  togglePlayPause: () => void;
  getIsPlaying: () => boolean;
}

export const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(
  (
    {
      audioUrl = "",
      soundscape,
      coverImage,
      title,
      subtitle,
      isPlayingExternal = false,
      onPlayPauseChange,
      onError,
      allowSoundscapeSelection = false,
      onSoundscapeChange,
      selectedSoundscape,
      availableSoundscapes = [],
    },
    ref
  ) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [hasError, setHasError] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const animationRef = useRef<number>();

    // Process audio URL
    const processedUrl = validateAudioUrl(audioUrl);
    
    // If soundscape is provided, it overrides the audioUrl
    const finalAudioUrl = soundscape?.audioUrl 
      ? validateAudioUrl(soundscape.audioUrl) 
      : processedUrl;

    // Display values
    const displayTitle = title || soundscape?.title || "";
    const displaySubtitle = subtitle || "";
    const displayCoverImage = coverImage || soundscape?.coverImageUrl || "";

    useEffect(() => {
      // Handle external play/pause control
      if (isPlayingExternal !== undefined) {
        if (isPlayingExternal && !isPlaying) {
          handlePlay();
        } else if (!isPlayingExternal && isPlaying) {
          handlePause();
        }
      }

      return () => {
        // Clean up animation
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [isPlayingExternal]);

    useEffect(() => {
      // Set up audio element event listeners
      const audio = audioRef.current;
      if (!audio) return;

      const onLoadedMetadata = () => {
        setDuration(audio.duration);
        setHasError(false);
      };

      const onTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const onEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (onPlayPauseChange) onPlayPauseChange(false);
      };

      const onError = () => {
        console.error("Audio error:", audio.error);
        setHasError(true);
        setIsPlaying(false);
        if (onPlayPauseChange) onPlayPauseChange(false);
        
        // Call onError callback if provided
        if (onError) onError();
        
        toast.error("Fout bij het laden van audio");
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
    }, [onPlayPauseChange, onError]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      play: handlePlay,
      pause: handlePause,
      stop: handleStop,
      setVolume: (vol: number) => {
        setVolume(vol);
        if (audioRef.current) {
          audioRef.current.volume = vol;
        }
      },
      getDuration: () => duration,
      getCurrentTime: () => currentTime,
      seekTo: (time: number) => {
        if (audioRef.current) {
          audioRef.current.currentTime = time;
        }
      },
      togglePlayPause: togglePlayPause,
      getIsPlaying: () => isPlaying,
    }));

    const togglePlayPause = () => {
      if (isPlaying) {
        handlePause();
      } else {
        handlePlay();
      }
    };

    const handlePlay = () => {
      if (!finalAudioUrl) {
        toast.error("Geen audio URL beschikbaar");
        return;
      }

      setIsPlaying(true);
      audioRef.current?.play().catch((error) => {
        console.error("Play error:", error);
        setIsPlaying(false);
        if (onPlayPauseChange) onPlayPauseChange(false);
        toast.error("Kon audio niet afspelen");
      });

      if (onPlayPauseChange) onPlayPauseChange(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
      audioRef.current?.pause();
      if (onPlayPauseChange) onPlayPauseChange(false);
    };

    const handleStop = () => {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setCurrentTime(0);
      if (onPlayPauseChange) onPlayPauseChange(false);
    };

    const handleVolumeChange = (value: number) => {
      setVolume(value);
      setIsMuted(value === 0);
      if (audioRef.current) {
        audioRef.current.volume = value;
      }
    };

    const handleMuteToggle = () => {
      if (audioRef.current) {
        if (isMuted) {
          audioRef.current.volume = volume === 0 ? 1 : volume;
          setIsMuted(false);
        } else {
          audioRef.current.volume = 0;
          setIsMuted(true);
        }
      }
    };

    const handleSeek = (value: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = value;
      }
    };

    const handleSoundscapeChange = (soundscape: Soundscape) => {
      if (onSoundscapeChange) {
        onSoundscapeChange(soundscape);
      }
    };

    return (
      <div className="w-full">
        {allowSoundscapeSelection && onSoundscapeChange && (
          <div className="mb-4">
            <MusicSelector
              soundscapes={availableSoundscapes}
              selectedSoundscape={selectedSoundscape}
              onSelectSoundscape={handleSoundscapeChange}
            />
          </div>
        )}

        <div className="flex flex-col w-full">
          <NowPlaying
            title={displayTitle}
            subtitle={displaySubtitle}
            coverImage={displayCoverImage}
            isPlaying={isPlaying}
          />

          <ProgressBar
            duration={duration}
            currentTime={currentTime}
            onSeek={handleSeek}
          />

          <AudioControls
            isPlaying={isPlaying}
            volume={volume}
            isMuted={isMuted}
            onPlayPause={togglePlayPause}
            onVolumeChange={handleVolumeChange}
            onMuteToggle={handleMuteToggle}
          />

          <audio
            ref={audioRef}
            src={finalAudioUrl}
            preload="metadata"
            style={{ display: "none" }}
          />
        </div>
      </div>
    );
  }
);

AudioPlayer.displayName = "AudioPlayer";
