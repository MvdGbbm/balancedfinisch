
import { ReactNode } from "react";

export type FilterBand = {
  frequency: number;
  gain: number;
  q: number;
};

export interface ToneEqualizerProps {
  isActive: boolean;
  className?: string;
  audioRef?: React.RefObject<HTMLAudioElement>;
}

export interface FrequencySliderProps {
  currentBand: FilterBand;
  onBandChange: (value: number[]) => void;
  isActive: boolean;
  isInitialized: boolean;
}

export interface FrequencySelectorProps {
  selectedFrequency: string;
  setSelectedFrequency: (value: string) => void;
  isActive: boolean;
  isInitialized: boolean;
}

export interface ReverbControlsProps {
  reverbEnabled: boolean;
  reverbAmount: number;
  handleReverbToggle: (checked: boolean) => void;
  handleReverbAmountChange: (value: number[]) => void;
  isActive: boolean;
  isInitialized: boolean;
}

export interface EqualizerHeaderProps {
  handleReset: () => void;
  masterVolume: number;
  handleVolumeChange: (value: number[]) => void;
  isActive: boolean;
  isInitialized: boolean;
}

export interface HealingFrequency {
  value: string;
  label: string;
}
