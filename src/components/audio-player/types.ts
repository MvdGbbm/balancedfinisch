
import { ReactNode } from "react";

export interface AudioPlayerProps {
  audioUrl: string;
  showControls?: boolean;
  showTitle?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  onEnded?: () => void;
  onError?: () => void;
  customSoundscapeSelector?: ReactNode;
  showQuote?: boolean;
  isPlayingExternal?: boolean;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  nextAudioUrl?: string;
  onCrossfadeStart?: () => void;
  volume?: number;
  showMusicSelector?: boolean;
  coverImage?: string;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  isLooping: boolean;
  isLoaded: boolean;
  loadError: boolean;
  isRetrying: boolean;
  isCrossfading: boolean;
  isLiveStream: boolean;
}

export interface AudioPlayerControls {
  togglePlay: () => void;
  handleRetry: () => void;
  toggleLoop: () => void;
  handleProgressChange: (newValue: number[]) => void;
  handleVolumeChange: (newValue: number[]) => void;
  skipTime: (amount: number) => void;
}

export interface MusicSelectorProps {
  selectedMusic?: string;
  onMusicChange?: (value: string) => void;
  soundscapes?: any[];
  selectedSoundscape?: any;
  onSelectSoundscape?: (soundscape: any) => void;
}

export interface NowPlayingProps {
  selectedMusic?: string;
  title?: string;
  subtitle?: string;
  coverImage?: string;
  isPlaying?: boolean;
}

export interface ProgressBarProps {
  currentTime: number;
  duration: number;
  isLoaded: boolean;
  isCrossfading: boolean;
  isLiveStream: boolean;
  handleProgressChange: (newValue: number[]) => void;
}

export interface AudioControlsProps {
  isPlaying: boolean;
  togglePlay: () => void;
  skipTime: (amount: number) => void;
  isLoaded: boolean;
  isLooping: boolean;
  toggleLoop: () => void;
  isCrossfading: boolean;
  isLiveStream: boolean;
  volume: number;
  handleVolumeChange: (newValue: number[]) => void;
  loadError: boolean;
  isMuted?: boolean;
  onMuteToggle?: () => void;
  onPlayPause?: () => void;
  onVolumeChange?: (value: number) => void;
}

export interface ErrorMessageProps {
  handleRetry: () => void;
  isRetrying: boolean;
  message?: string;
}
