
import { Meditation } from "@/lib/types";

export interface MeditationPlayerContainerProps {
  isVisible: boolean;
  selectedMeditation: Meditation | null;
}

export interface MeditationAudioPlayerProps {
  currentAudioUrl: string;
  selectedMeditation: Meditation;
  handleAudioError: () => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export interface MeditationCoverImageProps {
  imageUrl: string;
  title: string;
  onError: () => void;
}

export interface MeditationExternalLinksProps {
  selectedMeditation: Meditation;
  currentAudioUrl: string;
  onPlayExternalLink: (linkType: 'vera' | 'marco') => void;
}

export interface MeditationPlayerControlsProps {
  isPlaying: boolean;
  onStop: () => void;
  onStart: () => void;
  title: string;
}
