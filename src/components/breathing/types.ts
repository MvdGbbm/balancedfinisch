
export type BreathingPhase = 'start' | 'inhale' | 'hold' | 'exhale' | 'pause' | 'end';

export type BreathingTechnique = '4-7-8' | 'box-breathing' | 'diaphragmatic';

export interface BreathingAnimationProps {
  technique: BreathingTechnique;
  voiceUrls: {
    start?: string;
    inhale: string;
    hold: string;
    exhale: string;
    end?: string;
  } | null;
  isVoiceActive: boolean;
  currentPhase: BreathingPhase;
  onPhaseChange: (phase: BreathingPhase) => void;
  currentCycle: number;
  totalCycles: number;
  exerciseCompleted: boolean;
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
  pauseTime: number;
}
