
import React, { createContext, useContext, useState, useEffect } from "react";
import { Meditation, Soundscape, JournalEntry, DailyQuote, PlannerEvent } from "@/lib/types";

// Sample data
import { meditations } from "@/data/meditations";
import { soundscapes } from "@/data/soundscapes";
import { quotes } from "@/data/quotes";

interface AppContextType {
  // Data
  meditations: Meditation[];
  soundscapes: Soundscape[];
  journalEntries: JournalEntry[];
  dailyQuotes: DailyQuote[];
  plannerEvents: PlannerEvent[];
  
  // Current states
  currentMeditation: Meditation | null;
  currentSoundscape: Soundscape | null;
  currentQuote: DailyQuote | null;
  
  // Admin functions
  addMeditation: (meditation: Omit<Meditation, 'id' | 'createdAt'>) => void;
  updateMeditation: (id: string, meditation: Partial<Meditation>) => void;
  deleteMeditation: (id: string) => void;
  
  addSoundscape: (soundscape: Omit<Soundscape, 'id'>) => void;
  updateSoundscape: (id: string, soundscape: Partial<Soundscape>) => void;
  deleteSoundscape: (id: string) => void;
  
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
  setCurrentSoundscape: (soundscape: Soundscape | null) => void;
  getRandomQuote: () => DailyQuote;
  saveDailyQuoteToCalendar: (quote: DailyQuote) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // State
  const [meditationsData, setMeditations] = useState<Meditation[]>(meditations);
  const [soundscapesData, setSoundscapes] = useState<Soundscape[]>(soundscapes);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [dailyQuotes, setDailyQuotes] = useState<DailyQuote[]>(quotes);
  const [plannerEvents, setPlannerEvents] = useState<PlannerEvent[]>([]);
  
  const [currentMeditation, setCurrentMeditation] = useState<Meditation | null>(null);
  const [currentSoundscape, setCurrentSoundscape] = useState<Soundscape | null>(null);
  const [currentQuote, setCurrentQuote] = useState<DailyQuote | null>(null);
  
  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const storedMeditations = localStorage.getItem('meditations');
      if (storedMeditations) {
        setMeditations(JSON.parse(storedMeditations));
      }
      
      const storedSoundscapes = localStorage.getItem('soundscapes');
      if (storedSoundscapes) {
        setSoundscapes(JSON.parse(storedSoundscapes));
      }
      
      const storedJournalEntries = localStorage.getItem('journalEntries');
      if (storedJournalEntries) {
        setJournalEntries(JSON.parse(storedJournalEntries));
      }
      
      const storedQuotes = localStorage.getItem('quotes');
      if (storedQuotes) {
        setDailyQuotes(JSON.parse(storedQuotes));
      } else {
        setDailyQuotes(quotes);
      }
      
      const storedPlannerEvents = localStorage.getItem('plannerEvents');
      if (storedPlannerEvents) {
        setPlannerEvents(JSON.parse(storedPlannerEvents));
      }
      
      // Set random quote for today
      const todayQuoteId = localStorage.getItem('todayQuoteId');
      if (todayQuoteId) {
        const quote = quotes.find(q => q.id === todayQuoteId);
        if (quote) {
          setCurrentQuote(quote);
        } else {
          const randomQuote = getRandomQuote();
          setCurrentQuote(randomQuote);
        }
      } else {
        const randomQuote = getRandomQuote();
        setCurrentQuote(randomQuote);
        localStorage.setItem('todayQuoteId', randomQuote.id);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('meditations', JSON.stringify(meditationsData));
    } catch (error) {
      console.error('Error saving meditations to localStorage:', error);
    }
  }, [meditationsData]);
  
  useEffect(() => {
    try {
      localStorage.setItem('soundscapes', JSON.stringify(soundscapesData));
    } catch (error) {
      console.error('Error saving soundscapes to localStorage:', error);
    }
  }, [soundscapesData]);
  
  useEffect(() => {
    try {
      localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
    } catch (error) {
      console.error('Error saving journal entries to localStorage:', error);
    }
  }, [journalEntries]);
  
  useEffect(() => {
    try {
      localStorage.setItem('quotes', JSON.stringify(dailyQuotes));
    } catch (error) {
      console.error('Error saving quotes to localStorage:', error);
    }
  }, [dailyQuotes]);
  
  useEffect(() => {
    try {
      localStorage.setItem('plannerEvents', JSON.stringify(plannerEvents));
    } catch (error) {
      console.error('Error saving planner events to localStorage:', error);
    }
  }, [plannerEvents]);
  
  // Helper functions
  function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
  
  function getRandomQuote(): DailyQuote {
    const randomIndex = Math.floor(Math.random() * dailyQuotes.length);
    return dailyQuotes[randomIndex];
  }
  
  // CRUD functions for meditations
  function addMeditation(meditation: Omit<Meditation, 'id' | 'createdAt'>) {
    const newMeditation: Meditation = {
      ...meditation,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setMeditations([...meditationsData, newMeditation]);
  }
  
  function updateMeditation(id: string, meditation: Partial<Meditation>) {
    setMeditations(
      meditationsData.map((m) => (m.id === id ? { ...m, ...meditation } : m))
    );
  }
  
  function deleteMeditation(id: string) {
    setMeditations(meditationsData.filter((m) => m.id !== id));
  }
  
  // CRUD functions for soundscapes
  function addSoundscape(soundscape: Omit<Soundscape, 'id'>) {
    const newSoundscape: Soundscape = {
      ...soundscape,
      id: generateId(),
    };
    setSoundscapes([...soundscapesData, newSoundscape]);
  }
  
  function updateSoundscape(id: string, soundscape: Partial<Soundscape>) {
    setSoundscapes(
      soundscapesData.map((s) => (s.id === id ? { ...s, ...soundscape } : s))
    );
  }
  
  function deleteSoundscape(id: string) {
    setSoundscapes(soundscapesData.filter((s) => s.id !== id));
  }
  
  // CRUD functions for quotes
  function addQuote(quote: Omit<DailyQuote, 'id'>) {
    const newQuote: DailyQuote = {
      ...quote,
      id: generateId(),
    };
    setDailyQuotes([...dailyQuotes, newQuote]);
  }
  
  function updateQuote(id: string, quote: Partial<DailyQuote>) {
    setDailyQuotes(
      dailyQuotes.map((q) => (q.id === id ? { ...q, ...quote } : q))
    );
  }
  
  function deleteQuote(id: string) {
    setDailyQuotes(dailyQuotes.filter((q) => q.id !== id));
  }
  
  // CRUD functions for journal entries
  function addJournalEntry(entry: Omit<JournalEntry, 'id'>) {
    const newEntry: JournalEntry = {
      ...entry,
      id: generateId(),
    };
    setJournalEntries([...journalEntries, newEntry]);
  }
  
  function updateJournalEntry(id: string, entry: Partial<JournalEntry>) {
    setJournalEntries(
      journalEntries.map((e) => (e.id === id ? { ...e, ...entry } : e))
    );
  }
  
  function deleteJournalEntry(id: string) {
    setJournalEntries(journalEntries.filter((e) => e.id !== id));
  }
  
  // CRUD functions for planner events
  function addPlannerEvent(event: Omit<PlannerEvent, 'id'>) {
    const newEvent: PlannerEvent = {
      ...event,
      id: generateId(),
    };
    setPlannerEvents([...plannerEvents, newEvent]);
  }
  
  function updatePlannerEvent(id: string, event: Partial<PlannerEvent>) {
    setPlannerEvents(
      plannerEvents.map((e) => (e.id === id ? { ...e, ...event } : e))
    );
  }
  
  function deletePlannerEvent(id: string) {
    setPlannerEvents(plannerEvents.filter((e) => e.id !== id));
  }
  
  function toggleEventCompletion(id: string) {
    setPlannerEvents(
      plannerEvents.map((e) =>
        e.id === id ? { ...e, completed: !e.completed } : e
      )
    );
  }
  
  // Function to save daily quote to calendar
  function saveDailyQuoteToCalendar(quote: DailyQuote) {
    // Create a planner event for the quote
    const today = new Date().toISOString().split('T')[0];
    
    addPlannerEvent({
      title: `Dagelijkse quote: ${quote.text.substring(0, 30)}...`,
      date: today,
      completed: false,
    });
    
    // Show success message
    alert("Quote opgeslagen in de agenda!");
  }
  
  // Context value
  const value: AppContextType = {
    meditations: meditationsData,
    soundscapes: soundscapesData,
    journalEntries,
    dailyQuotes,
    plannerEvents,
    
    currentMeditation,
    currentSoundscape,
    currentQuote,
    
    addMeditation,
    updateMeditation,
    deleteMeditation,
    
    addSoundscape,
    updateSoundscape,
    deleteSoundscape,
    
    addQuote,
    updateQuote,
    deleteQuote,
    
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    
    addPlannerEvent,
    updatePlannerEvent,
    deletePlannerEvent,
    toggleEventCompletion,
    
    setCurrentMeditation,
    setCurrentSoundscape,
    getRandomQuote,
    saveDailyQuoteToCalendar,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
