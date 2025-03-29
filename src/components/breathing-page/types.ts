
import { BreathingPhase } from '../breathing/types';
import { Soundscape } from '@/lib/types';

export type BreathType = "relaxation" | "energy" | "stress" | "focus" | "sleep";

export type BreathingPattern = {
  id: string;
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number;
  description?: string;
  startUrl?: string;
  endUrl?: string;
};

export type VoiceURLs = {
  start?: string;
  inhale: string;
  hold: string;
  exhale: string;
  holdAfterInhale?: string;
  holdAfterExhale?: string;
  end?: string;
};

export interface PatternSelectorProps {
  breathingPatterns: BreathingPattern[];
  selectedPattern: BreathingPattern | null;
  isExerciseActive: boolean;
  onSelectPattern: (patternId: string) => void;
}

export interface MusicPlayerProps {
  musicTracks: Soundscape[];
  currentTrack: Soundscape | null;
  isTrackPlaying: boolean;
  musicVolume: number;
  onPlayTrack: (track: Soundscape) => void;
  audioPlayerRef: React.RefObject<HTMLAudioElement>;
  onTrackPlayPauseChange: (isPlaying: boolean) => void;
}
