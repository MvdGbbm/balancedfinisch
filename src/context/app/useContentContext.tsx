
import { useState, useEffect } from 'react';
import { JournalEntry, DailyQuote, PlannerEvent } from '@/lib/types';
import { generateId } from './utils';
import { quotes as initialQuotes } from "@/data/quotes";

export function useContentContext() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [dailyQuotes, setDailyQuotes] = useState<DailyQuote[]>(initialQuotes);
  const [plannerEvents, setPlannerEvents] = useState<PlannerEvent[]>([]);
  const [currentQuote, setCurrentQuote] = useState<DailyQuote | null>(null);

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const storedJournalEntries = localStorage.getItem('journalEntries');
      if (storedJournalEntries) {
        setJournalEntries(JSON.parse(storedJournalEntries));
      }
      
      const storedQuotes = localStorage.getItem('quotes');
      if (storedQuotes) {
        setDailyQuotes(JSON.parse(storedQuotes));
      } else {
        setDailyQuotes(initialQuotes);
      }
      
      const storedPlannerEvents = localStorage.getItem('plannerEvents');
      if (storedPlannerEvents) {
        setPlannerEvents(JSON.parse(storedPlannerEvents));
      }
      
      // Set random quote for today
      const todayQuoteId = localStorage.getItem('todayQuoteId');
      if (todayQuoteId) {
        const quote = initialQuotes.find(q => q.id === todayQuoteId);
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
  
  // Function to save daily quote to journal
  function saveDailyQuoteToCalendar(quote: DailyQuote) {
    // Create a journal entry for the quote instead of a planner event
    const today = new Date().toISOString().split('T')[0];
    
    addJournalEntry({
      date: today,
      content: `"${quote.text}" - ${quote.author}`,
      mood: "calm", // Default to a calm mood
      tags: ["quote"], // Add a "quote" tag for easy filtering
    });
    
    // Show success message
    alert("Quote opgeslagen in het dagboek!");
  }

  return {
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
  };
}
