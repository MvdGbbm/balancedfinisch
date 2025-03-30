
import { RefObject } from "react";

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

export interface UseAudioPlayerProps {
  audioUrl: string;
  onEnded?: () => void;
  onError?: () => void;
  isPlayingExternal?: boolean;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  nextAudioUrl?: string;
  onCrossfadeStart?: () => void;
  title?: string;
  volume?: number;
}

export interface AudioPlayerHookReturn extends AudioPlayerState, AudioPlayerControls {
  audioRef: RefObject<HTMLAudioElement>;
  nextAudioRef: RefObject<HTMLAudioElement>;
}

export const CROSSFADE_DURATION = 5;
export const MAX_RETRY_COUNT = 3;
