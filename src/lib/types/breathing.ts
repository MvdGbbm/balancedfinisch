
import { Database } from "@/integrations/supabase/types";

export type BreathingPattern = Database["public"]["Tables"]["breathing_patterns"]["Row"];

export interface BreathingExerciseState {
  isActive: boolean;
  currentPhase: "inhale" | "hold1" | "exhale" | "hold2" | "rest";
  currentCycle: number;
  secondsLeft: number;
  audioUrl?: string;
}
