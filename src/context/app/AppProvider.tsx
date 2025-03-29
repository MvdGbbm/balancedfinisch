
import React, { createContext, useContext, useState } from "react";
import { AppContextType } from "./types";
import { useMeditationsContext } from "./useMeditationsContext";
import { useSoundscapesContext } from "./useSoundscapesContext";
import { useContentContext } from "./useContentContext";
import { Meditation, Soundscape } from "@/lib/types";

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Current states
  const [currentMeditation, setCurrentMeditation] = useState<Meditation | null>(null);
  const [currentSoundscape, setCurrentSoundscape] = useState<Soundscape | null>(null);
  
  // Import functionality from separate modules
  const { 
    meditationsData: meditations,
    addMeditation,
    updateMeditation,
    deleteMeditation
  } = useMeditationsContext();
  
  const {
    soundscapesData: soundscapes,
    setSoundscapes,
    addSoundscape,
    updateSoundscape,
    deleteSoundscape
  } = useSoundscapesContext();
  
  const {
    journalEntries,
    dailyQuotes,
    plannerEvents,
    currentQuote,
    getRandomQuote,
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
    saveDailyQuoteToCalendar
  } = useContentContext();
  
  // Context value
  const contextValue: AppContextType = {
    meditations,
    soundscapes,
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
    setSoundscapes,
    
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
  
  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
