
// Define breathing phases
export type BreathingPhase = 
  | "start"     // Before the exercise starts
  | "inhale"    // Breathing in
  | "hold"      // Holding breath after inhaling
  | "exhale"    // Breathing out
  | "pause"     // Pause after exhaling
  | "end";      // Exercise complete

// Define exercise settings
export interface BreathingExerciseSettings {
  cycles: number;
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
  pauseTime: number;
}

// Define status
export interface BreathingStatus {
  currentPhase: BreathingPhase;
  currentCycle: number;
  secondsLeft: number;
  isActive: boolean;
  isComplete: boolean;
}

// Define audio options
export interface BreathingAudioOptions {
  voiceEnabled: boolean;
  musicEnabled: boolean;
  voiceVolume: number;
  musicVolume: number;
}
