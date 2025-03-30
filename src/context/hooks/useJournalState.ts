
import { useState, useEffect } from "react";
import { JournalEntry, DailyQuote } from "@/lib/types";
import { generateId } from "../utils";

export function useJournalState() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  
  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const storedJournalEntries = localStorage.getItem('journalEntries');
      if (storedJournalEntries) {
        setJournalEntries(JSON.parse(storedJournalEntries));
      }
    } catch (error) {
      console.error('Error loading journal entries from localStorage:', error);
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
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    saveDailyQuoteToCalendar
  };
}
