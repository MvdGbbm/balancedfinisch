
export interface Meditation {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
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
