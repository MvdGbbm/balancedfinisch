
import { useState, useEffect } from "react";
import { DailyQuote } from "@/lib/types";
import { quotes as sampleQuotes } from "@/data/quotes";
import { generateId } from "../utils";

export function useQuoteState() {
  const [dailyQuotes, setDailyQuotes] = useState<DailyQuote[]>(sampleQuotes);
  const [currentQuote, setCurrentQuote] = useState<DailyQuote | null>(null);
  
  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const storedQuotes = localStorage.getItem('quotes');
      if (storedQuotes) {
        setDailyQuotes(JSON.parse(storedQuotes));
      } else {
        setDailyQuotes(sampleQuotes);
      }
      
      // Set random quote for today
      const todayQuoteId = localStorage.getItem('todayQuoteId');
      if (todayQuoteId) {
        const quote = sampleQuotes.find(q => q.id === todayQuoteId);
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
      console.error('Error loading quotes from localStorage:', error);
    }
  }, []);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('quotes', JSON.stringify(dailyQuotes));
    } catch (error) {
      console.error('Error saving quotes to localStorage:', error);
    }
  }, [dailyQuotes]);
  
  function getRandomQuote(): DailyQuote {
    const randomIndex = Math.floor(Math.random() * dailyQuotes.length);
    return dailyQuotes[randomIndex];
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
  
  return {
    dailyQuotes,
    currentQuote,
    getRandomQuote,
    addQuote,
    updateQuote,
    deleteQuote
  };
}
