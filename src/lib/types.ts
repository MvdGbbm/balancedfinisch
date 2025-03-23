
export interface Meditation {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  coverImageUrl: string;
  duration: number; // in minutes
  category: string;
  tags: string[];
  veraLink?: string;
  marcoLink?: string;
  createdAt?: string; // Adding the createdAt property
}

export interface Soundscape {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  category: string;
  coverImageUrl: string;
  tags: string[];
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
  date?: string;
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
