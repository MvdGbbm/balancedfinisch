
export interface Meditation {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  category: string;
  coverImageUrl: string;
  tags: string[];
  createdAt: string;
  veraLink?: string;
  marcoLink?: string;
  isFavorite?: boolean;
}

export interface Soundscape {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  category: string;
  coverImageUrl: string;
  tags: string[];
  duration?: number;
  isFavorite?: boolean;
}

export interface DailyQuote {
  id: string;
  text: string;
  author: string;
  date?: string;
  tags?: string[];
  category?: string;
  backgroundClass?: string;
}

export interface JournalEntry {
  id: string;
  title?: string;  // Made optional since some code doesn't provide it
  content: string;
  date: string;
  mood?: "happy" | "calm" | "neutral" | "sad" | "anxious";
  tags?: string[];
}

export interface PlannerEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;       // Required field
  date?: string;           // Optional for backward compatibility
  time?: string;
  duration?: number;
  meditationId?: string;
  endDate?: string;
  allDay?: boolean;
  category?: string;
  completed?: boolean;
  color?: string;
}

export interface BreathingPattern {
  id: string;
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2?: number;
  cycles: number;
  description: string;
  category?: string;
}

// Voice URLs interface used in breathing components
export interface VoiceUrls {
  start?: string;
  inhale: string;
  hold: string;
  exhale: string;
}

// Added for consistent reference in breathing components
export type ActiveVoice = "vera" | "marco" | "none";
