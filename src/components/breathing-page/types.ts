
import { Soundscape } from "@/lib/types";

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  defaultCycles: number;
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

export interface VoiceURLs {
  start?: string;
  inhale: string;
  hold: string;
  exhale: string;
  end?: string;
}
