
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
  mood?: string;
  tags?: string[];
}

export interface PlannerEvent {
  id: string;
  title: string;
  description?: string;
  date?: string;        // Added for Planner.tsx
  time?: string;        // Added for Planner.tsx
  duration?: number;    // Added for Planner.tsx
  meditationId?: string; // Added for Planner.tsx
  startDate: string;
  endDate?: string;
  allDay?: boolean;
  category?: string;
  completed?: boolean;
  color?: string;
}

export interface BreathingPattern {
  id: string;
  name: string;
  inhale: number;       // Changed from inhaleDuration to match usage
  hold1: number;        // Changed from holdDuration
  exhale: number;       // Changed from exhaleDuration
  hold2?: number;       // Added based on usage
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
