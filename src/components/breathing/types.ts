
export type BreathingTechnique = '4-7-8' | 'box-breathing' | 'diaphragmatic';
export type BreathingPhase = 'start' | 'inhale' | 'hold' | 'exhale' | 'pause';

export interface BreathingAnimationProps {
  technique: BreathingTechnique;
  voiceUrls: {
    start?: string;
    inhale: string;
    hold: string;
    exhale: string;
  } | null;
  isVoiceActive: boolean;
  currentPhase?: BreathingPhase;
  onPhaseChange?: (phase: BreathingPhase) => void;
  currentCycle?: number;
  totalCycles?: number;
  exerciseCompleted?: boolean;
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
  pauseTime: number;
}

export interface BreathingCircleProps {
  phase: BreathingPhase;
  count: number;
  exerciseCompleted: boolean;
  currentCycle: number;
  totalCycles: number;
  animationDuration: number;
  onToggleActive: () => void;
}

export interface BreathingExerciseTestProps {
  pattern: {
    id: string;
    name: string;
    inhale: number;
    hold1: number;
    exhale: number;
    hold2: number;
    cycles: number;
    description?: string;
    inhaleUrl?: string;
    exhaleUrl?: string;
    hold1Url?: string;
    hold2Url?: string;
    endUrl?: string;
  } | null;
}
