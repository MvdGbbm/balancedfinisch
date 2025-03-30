
// Import required types
import { Meditation, JournalEntry, DailyQuote, PlannerEvent } from "@/lib/types";
import { Soundscape } from "@/components/admin/music/types";

export interface AppContextType {
  // Data
  meditations: Meditation[];
  journalEntries: JournalEntry[];
  dailyQuotes: DailyQuote[];
  plannerEvents: PlannerEvent[];
  soundscapes: Soundscape[];
  
  // Current states
  currentMeditation: Meditation | null;
  currentQuote: DailyQuote | null;
  
  // Admin functions
  addMeditation: (meditation: Omit<Meditation, 'id' | 'createdAt'>) => void;
  updateMeditation: (id: string, meditation: Partial<Meditation>) => void;
  deleteMeditation: (id: string) => void;
  
  addQuote: (quote: Omit<DailyQuote, 'id'>) => void;
  updateQuote: (id: string, quote: Partial<DailyQuote>) => void;
  deleteQuote: (id: string) => void;
  
  // Journal functions
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateJournalEntry: (id: string, entry: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  
  // Planner functions
  addPlannerEvent: (event: Omit<PlannerEvent, 'id'>) => void;
  updatePlannerEvent: (id: string, event: Partial<PlannerEvent>) => void;
  deletePlannerEvent: (id: string) => void;
  toggleEventCompletion: (id: string) => void;
  
  // App functions
  setCurrentMeditation: (meditation: Meditation | null) => void;
  getRandomQuote: () => DailyQuote;
  saveDailyQuoteToCalendar: (quote: DailyQuote) => void;
}
