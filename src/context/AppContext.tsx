
import React, { createContext, useContext, useState, useEffect } from "react";
import { quotes } from "@/data/quotes";
import { DailyQuote } from "@/components/audio-player/utils";

interface AppContextType {
  currentQuote: DailyQuote | null;
  meditations: any[];
  soundscapes: any[];
  setSoundscapes: React.Dispatch<React.SetStateAction<any[]>>;
  refreshData: () => void;
}

const defaultContext: AppContextType = {
  currentQuote: null,
  meditations: [],
  soundscapes: [],
  setSoundscapes: () => {},
  refreshData: () => {}
};

const AppContext = createContext<AppContextType>(defaultContext);

export const useApp = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentQuote, setCurrentQuote] = useState<DailyQuote | null>(null);
  const [meditations, setMeditations] = useState<any[]>([]);
  const [soundscapes, setSoundscapes] = useState<any[]>([]);
  
  // Load initial data
  useEffect(() => {
    loadQuote();
    loadMeditations();
    loadSoundscapes();
  }, []);
  
  const loadQuote = () => {
    // Get today's date as a string in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we've already set a quote for today
    const lastQuoteDay = localStorage.getItem('todayQuoteId');
    
    if (lastQuoteDay === today && localStorage.getItem('dailyQuote')) {
      // Use the saved quote if we already have one for today
      try {
        const savedQuote = JSON.parse(localStorage.getItem('dailyQuote') || '');
        setCurrentQuote(savedQuote);
      } catch (e) {
        // If there's an error, just get a new quote
        getRandomQuote();
      }
    } else {
      // Get a new quote for today
      getRandomQuote();
      localStorage.setItem('todayQuoteId', today);
    }
  };
  
  const getRandomQuote = () => {
    if (quotes && quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      const quote = quotes[randomIndex];
      setCurrentQuote(quote);
      
      // Save today's quote
      localStorage.setItem('dailyQuote', JSON.stringify(quote));
    }
  };
  
  const loadMeditations = () => {
    // Check if we have processed meditations in local storage
    const savedMeditations = localStorage.getItem('processedMeditations');
    
    if (savedMeditations) {
      try {
        console.info("Using cached meditation URLs");
        const parsed = JSON.parse(savedMeditations);
        setMeditations(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error("Error parsing saved meditations:", error);
        setMeditations([]);
      }
    } else {
      console.info("No cached meditation data found");
      setMeditations([]); // Initialize with empty array
    }
  };
  
  const loadSoundscapes = () => {
    // Check if we have processed soundscapes in local storage
    const savedSoundscapes = localStorage.getItem('processedSoundscapes');
    
    if (savedSoundscapes) {
      try {
        console.info("Using cached soundscape URLs");
        const parsed = JSON.parse(savedSoundscapes);
        setSoundscapes(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error("Error parsing saved soundscapes:", error);
        setSoundscapes([]);
      }
    } else {
      console.info("No cached soundscape data found");
      setSoundscapes([]); // Initialize with empty array
    }
  };
  
  const refreshData = () => {
    loadQuote();
    loadMeditations();
    loadSoundscapes();
  };
  
  return (
    <AppContext.Provider
      value={{
        currentQuote,
        meditations,
        soundscapes,
        setSoundscapes,
        refreshData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
