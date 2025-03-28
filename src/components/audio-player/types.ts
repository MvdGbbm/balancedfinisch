
import { ReactNode } from "react";

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

export interface AudioPlayerProps {
  audioUrl: string;
  showControls?: boolean;
  showTitle?: boolean;
  title?: string;
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
  ref?: React.Ref<HTMLAudioElement>;
  showMusicSelector?: boolean;
}
