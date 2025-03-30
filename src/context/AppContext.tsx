
import React, { createContext, useContext } from "react";
import { AppContextType } from "./types";
import { useMeditationState } from "./hooks/useMeditationState";
import { useQuoteState } from "./hooks/useQuoteState";
import { useJournalState } from "./hooks/useJournalState";
import { usePlannerState } from "./hooks/usePlannerState";

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create the provider
export function AppProvider({ children }: { children: React.ReactNode }) {
  // Use custom hooks for each domain
  const meditationState = useMeditationState();
  const quoteState = useQuoteState();
  const journalState = useJournalState();
  const plannerState = usePlannerState();
  
  // Context value combining all state
  const value: AppContextType = {
    // Data
    meditations: meditationState.meditations,
    journalEntries: journalState.journalEntries,
    dailyQuotes: quoteState.dailyQuotes,
    plannerEvents: plannerState.plannerEvents,
    
    // Current states
    currentMeditation: meditationState.currentMeditation,
    currentQuote: quoteState.currentQuote,
    
    // Admin functions
    addMeditation: meditationState.addMeditation,
    updateMeditation: meditationState.updateMeditation,
    deleteMeditation: meditationState.deleteMeditation,
    
    addQuote: quoteState.addQuote,
    updateQuote: quoteState.updateQuote,
    deleteQuote: quoteState.deleteQuote,
    
    // Journal functions
    addJournalEntry: journalState.addJournalEntry,
    updateJournalEntry: journalState.updateJournalEntry,
    deleteJournalEntry: journalState.deleteJournalEntry,
    
    // Planner functions
    addPlannerEvent: plannerState.addPlannerEvent,
    updatePlannerEvent: plannerState.updatePlannerEvent,
    deletePlannerEvent: plannerState.deletePlannerEvent,
    toggleEventCompletion: plannerState.toggleEventCompletion,
    
    // App functions
    setCurrentMeditation: meditationState.setCurrentMeditation,
    getRandomQuote: quoteState.getRandomQuote,
    saveDailyQuoteToCalendar: journalState.saveDailyQuoteToCalendar,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
