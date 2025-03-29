
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
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: string;
  tags?: string[];
}

export interface PlannerEvent {
  id: string;
  title: string;
  description?: string;
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
  inhaleDuration: number;
  holdDuration: number;
  exhaleDuration: number;
  cycles: number;
  description: string;
  category?: string;
}
