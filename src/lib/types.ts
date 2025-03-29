
export interface Meditation {
  id: string;
  title: string;
  description: string;
  audioUrl?: string;
  duration: number;
  category: string;
  coverImageUrl: string;
  tags: string[];
  createdAt?: string;
  veraLink?: string;
  marcoLink?: string;
}

export interface Soundscape {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  category: string;
  coverImageUrl: string;
  tags: string[];
  isFavorite?: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: "happy" | "calm" | "neutral" | "sad" | "anxious";
  tags: string[];
}

export interface DailyQuote {
  id: string;
  text: string;
  author: string;
  backgroundClass?: string;
}

export interface PlannerEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  duration?: number;
  completed: boolean;
  meditationId?: string;
}

export interface BreathingPattern {
  id: string;
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number;
  description?: string;
  // Custom text for each phase
  inhaleText?: string;
  hold1Text?: string;
  exhaleText?: string;
  hold2Text?: string;
  // URL to play at the start of the exercise
  startUrl?: string;
  // Audio URLs for specific phases
  inhaleUrl?: string;
  exhaleUrl?: string;
  hold1Url?: string;
  hold2Url?: string;
  // Audio URLs for specific voices
  veraInhaleUrl?: string;
  veraHoldUrl?: string;
  veraExhaleUrl?: string;
  marcoInhaleUrl?: string;
  marcoHoldUrl?: string;
  marcoExhaleUrl?: string;
  // URL to play at the end of the exercise
  endUrl?: string;
}

export interface BreathingVoice {
  name: "vera" | "marco" | "none";
  inhaleUrl: string;
  holdUrl: string;
  exhaleUrl: string;
}
