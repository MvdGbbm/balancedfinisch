import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateId } from './utils';
import { AppContextType } from './types';
import { 
  Meditation, 
  Soundscape, 
  JournalEntry, 
  DailyQuote, 
  PlannerEvent 
} from '@/lib/types';
import { meditations as sampleMeditations } from '@/data/meditations';
import { soundscapes as sampleSoundscapes } from '@/data/soundscapes';
import { quotes as sampleQuotes } from '@/data/quotes';

// Create context with default empty values
const AppContext = createContext<AppContextType>({
  // Data
  meditations: [],
  soundscapes: [],
  journalEntries: [],
  dailyQuotes: [],
  plannerEvents: [],
  
  // Current states
  currentMeditation: null,
  currentSoundscape: null,
  currentQuote: null,
  
  // Admin functions
  addMeditation: () => {},
  updateMeditation: () => {},
  deleteMeditation: () => {},
  
  addSoundscape: () => {},
  updateSoundscape: () => {},
  deleteSoundscape: () => {},
  setSoundscapes: () => {},
  
  addQuote: () => {},
  updateQuote: () => {},
  deleteQuote: () => {},
  
  // Journal functions
  addJournalEntry: () => {},
  updateJournalEntry: () => {},
  deleteJournalEntry: () => {},
  
  // Planner functions
  addPlannerEvent: () => {},
  updatePlannerEvent: () => {},
  deletePlannerEvent: () => {},
  toggleEventCompletion: () => {},
  
  // App functions
  setCurrentMeditation: () => {},
  setCurrentSoundscape: () => {},
  getRandomQuote: () => ({ id: '', text: '', author: '', date: '' }),
  saveDailyQuoteToCalendar: () => {},
});

// Custom hook to use the AppContext
export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  // State for meditations
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [currentMeditation, setCurrentMeditation] = useState<Meditation | null>(null);
  
  // State for soundscapes
  const [soundscapes, setSoundscapes] = useState<Soundscape[]>([]);
  const [currentSoundscape, setCurrentSoundscape] = useState<Soundscape | null>(null);
  
  // State for journal entries
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  
  // State for daily quotes
  const [dailyQuotes, setDailyQuotes] = useState<DailyQuote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<DailyQuote | null>(null);
  
  // State for planner events
  const [plannerEvents, setPlannerEvents] = useState<PlannerEvent[]>([]);

  // Initialize data from localStorage or defaults
  useEffect(() => {
    // Load meditations
    const savedMeditations = localStorage.getItem('meditations');
    if (savedMeditations) {
      const parsedMeditations = JSON.parse(savedMeditations);
      setMeditations(parsedMeditations);
      console.log('Using cached meditations');
    } else {
      // Use default meditations
      const processedMeditations = sampleMeditations.map(meditation => ({
        ...meditation,
        audioUrl: meditation.audioUrl || '',
        isFavorite: meditation.isFavorite || false,
        tags: meditation.tags || [],
        createdAt: meditation.createdAt || new Date().toISOString(),
      }));
      setMeditations(processedMeditations);
      localStorage.setItem('meditations', JSON.stringify(processedMeditations));
      console.log('Using default meditations');
    }
    
    // Load soundscapes
    const savedSoundscapes = localStorage.getItem('soundscapes');
    if (savedSoundscapes) {
      const parsedSoundscapes = JSON.parse(savedSoundscapes);
      setSoundscapes(parsedSoundscapes);
      console.log('Using cached soundscapes');
    } else {
      // Use default soundscapes
      const processedSoundscapes = sampleSoundscapes.map(soundscape => ({
        ...soundscape,
        audioUrl: soundscape.audioUrl || '',
        isFavorite: soundscape.isFavorite || false,
      }));
      setSoundscapes(processedSoundscapes);
      localStorage.setItem('soundscapes', JSON.stringify(processedSoundscapes));
      console.log('Using default soundscapes');
    }
    
    // Load journal entries
    const savedJournalEntries = localStorage.getItem('journalEntries');
    if (savedJournalEntries) {
      setJournalEntries(JSON.parse(savedJournalEntries));
    }
    
    // Load daily quotes
    const savedDailyQuotes = localStorage.getItem('dailyQuotes');
    if (savedDailyQuotes) {
      setDailyQuotes(JSON.parse(savedDailyQuotes));
    } else {
      setDailyQuotes(sampleQuotes);
      localStorage.setItem('dailyQuotes', JSON.stringify(sampleQuotes));
    }
    
    // Load current quote
    const savedCurrentQuote = localStorage.getItem('currentQuote');
    if (savedCurrentQuote) {
      setCurrentQuote(JSON.parse(savedCurrentQuote));
    } else if (sampleQuotes.length > 0) {
      setCurrentQuote(sampleQuotes[0]);
      localStorage.setItem('currentQuote', JSON.stringify(sampleQuotes[0]));
    }
    
    // Load planner events
    const savedPlannerEvents = localStorage.getItem('plannerEvents');
    if (savedPlannerEvents) {
      setPlannerEvents(JSON.parse(savedPlannerEvents));
    }
  }, []);

  // Meditation CRUD Operations
  const addMeditation = (meditation: Omit<Meditation, 'id' | 'createdAt'>) => {
    const newMeditation: Meditation = {
      ...meditation,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedMeditations = [...meditations, newMeditation];
    setMeditations(updatedMeditations);
    localStorage.setItem('meditations', JSON.stringify(updatedMeditations));
    return newMeditation;
  };
  
  const updateMeditation = (id: string, updatedFields: Partial<Meditation>) => {
    const updatedMeditations = meditations.map(meditation => 
      meditation.id === id ? { ...meditation, ...updatedFields } : meditation
    );
    
    setMeditations(updatedMeditations);
    localStorage.setItem('meditations', JSON.stringify(updatedMeditations));
    
    // Update current meditation if it's the one being updated
    if (currentMeditation && currentMeditation.id === id) {
      setCurrentMeditation({ ...currentMeditation, ...updatedFields });
    }
  };
  
  const deleteMeditation = (id: string) => {
    const filteredMeditations = meditations.filter(meditation => meditation.id !== id);
    setMeditations(filteredMeditations);
    localStorage.setItem('meditations', JSON.stringify(filteredMeditations));
    
    // Reset current meditation if it's the one being deleted
    if (currentMeditation && currentMeditation.id === id) {
      setCurrentMeditation(null);
    }
  };

  // Soundscape CRUD Operations
  const addSoundscape = (soundscape: Omit<Soundscape, 'id'>) => {
    const newSoundscape: Soundscape = {
      ...soundscape,
      id: generateId(),
    };
    
    const updatedSoundscapes = [...soundscapes, newSoundscape];
    setSoundscapes(updatedSoundscapes);
    localStorage.setItem('soundscapes', JSON.stringify(updatedSoundscapes));
    return newSoundscape;
  };
  
  const updateSoundscape = (id: string, updatedFields: Partial<Soundscape>) => {
    const updatedSoundscapes = soundscapes.map(soundscape => 
      soundscape.id === id ? { ...soundscape, ...updatedFields } : soundscape
    );
    
    setSoundscapes(updatedSoundscapes);
    localStorage.setItem('soundscapes', JSON.stringify(updatedSoundscapes));
    
    // Update current soundscape if it's the one being updated
    if (currentSoundscape && currentSoundscape.id === id) {
      setCurrentSoundscape({ ...currentSoundscape, ...updatedFields });
    }
  };
  
  const deleteSoundscape = (id: string) => {
    const filteredSoundscapes = soundscapes.filter(soundscape => soundscape.id !== id);
    setSoundscapes(filteredSoundscapes);
    localStorage.setItem('soundscapes', JSON.stringify(filteredSoundscapes));
    
    // Reset current soundscape if it's the one being deleted
    if (currentSoundscape && currentSoundscape.id === id) {
      setCurrentSoundscape(null);
    }
  };

  // Daily Quote CRUD Operations
  const addQuote = (quote: Omit<DailyQuote, 'id'>) => {
    const newQuote: DailyQuote = {
      ...quote,
      id: generateId(),
    };
    
    const updatedQuotes = [...dailyQuotes, newQuote];
    setDailyQuotes(updatedQuotes);
    localStorage.setItem('dailyQuotes', JSON.stringify(updatedQuotes));
    return newQuote;
  };
  
  const updateQuote = (id: string, updatedFields: Partial<DailyQuote>) => {
    const updatedQuotes = dailyQuotes.map(quote => 
      quote.id === id ? { ...quote, ...updatedFields } : quote
    );
    
    setDailyQuotes(updatedQuotes);
    localStorage.setItem('dailyQuotes', JSON.stringify(updatedQuotes));
    
    // Update current quote if it's the one being updated
    if (currentQuote && currentQuote.id === id) {
      setCurrentQuote({ ...currentQuote, ...updatedFields });
    }
  };
  
  const deleteQuote = (id: string) => {
    const filteredQuotes = dailyQuotes.filter(quote => quote.id !== id);
    setDailyQuotes(filteredQuotes);
    localStorage.setItem('dailyQuotes', JSON.stringify(filteredQuotes));
    
    // Reset current quote if it's the one being deleted
    if (currentQuote && currentQuote.id === id) {
      setCurrentQuote(filteredQuotes[0] || null);
    }
  };

  // Journal CRUD Operations
  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: generateId(),
    };
    
    const updatedEntries = [...journalEntries, newEntry];
    setJournalEntries(updatedEntries);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    return newEntry;
  };
  
  const updateJournalEntry = (id: string, updatedFields: Partial<JournalEntry>) => {
    const updatedEntries = journalEntries.map(entry => 
      entry.id === id ? { ...entry, ...updatedFields } : entry
    );
    
    setJournalEntries(updatedEntries);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
  };
  
  const deleteJournalEntry = (id: string) => {
    const filteredEntries = journalEntries.filter(entry => entry.id !== id);
    setJournalEntries(filteredEntries);
    localStorage.setItem('journalEntries', JSON.stringify(filteredEntries));
  };

  // Planner CRUD Operations
  const addPlannerEvent = (event: Omit<PlannerEvent, 'id'>) => {
    const newEvent: PlannerEvent = {
      ...event,
      id: generateId(),
    };
    
    const updatedEvents = [...plannerEvents, newEvent];
    setPlannerEvents(updatedEvents);
    localStorage.setItem('plannerEvents', JSON.stringify(updatedEvents));
    return newEvent;
  };
  
  const updatePlannerEvent = (id: string, updatedFields: Partial<PlannerEvent>) => {
    const updatedEvents = plannerEvents.map(event => 
      event.id === id ? { ...event, ...updatedFields } : event
    );
    
    setPlannerEvents(updatedEvents);
    localStorage.setItem('plannerEvents', JSON.stringify(updatedEvents));
  };
  
  const deletePlannerEvent = (id: string) => {
    const filteredEvents = plannerEvents.filter(event => event.id !== id);
    setPlannerEvents(filteredEvents);
    localStorage.setItem('plannerEvents', JSON.stringify(filteredEvents));
  };
  
  const toggleEventCompletion = (id: string) => {
    const updatedEvents = plannerEvents.map(event => 
      event.id === id ? { ...event, completed: !event.completed } : event
    );
    
    setPlannerEvents(updatedEvents);
    localStorage.setItem('plannerEvents', JSON.stringify(updatedEvents));
  };

  // App Functions
  const getRandomQuote = (): DailyQuote => {
    if (dailyQuotes.length === 0) return { id: '', text: '', author: '', date: '' };
    
    const randomIndex = Math.floor(Math.random() * dailyQuotes.length);
    const randomQuote = dailyQuotes[randomIndex];
    
    setCurrentQuote(randomQuote);
    localStorage.setItem('currentQuote', JSON.stringify(randomQuote));
    
    return randomQuote;
  };
  
  const saveDailyQuoteToCalendar = (quote: DailyQuote) => {
    // Implementation for saving to calendar
    console.log('Saving quote to calendar:', quote);
    // Additional logic would go here
  };

  const value: AppContextType = {
    // Data
    meditations,
    soundscapes,
    journalEntries,
    dailyQuotes,
    plannerEvents,
    
    // Current states
    currentMeditation,
    currentSoundscape,
    currentQuote,
    
    // Admin functions
    addMeditation,
    updateMeditation,
    deleteMeditation,
    
    addSoundscape,
    updateSoundscape,
    deleteSoundscape,
    setSoundscapes,
    
    addQuote,
    updateQuote,
    deleteQuote,
    
    // Journal functions
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    
    // Planner functions
    addPlannerEvent,
    updatePlannerEvent,
    deletePlannerEvent,
    toggleEventCompletion,
    
    // App functions
    setCurrentMeditation,
    setCurrentSoundscape,
    getRandomQuote,
    saveDailyQuoteToCalendar,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
