
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";

export type Quote = {
  id: string;
  text: string;
  author?: string;
};

export function useQuote() {
  const { dailyQuotes } = useApp();
  const [quote, setQuote] = useState<Quote | null>(null);
  
  useEffect(() => {
    if (dailyQuotes && dailyQuotes.length > 0) {
      // Get a random quote or a daily quote based on the date
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
      const index = dayOfYear % dailyQuotes.length;
      setQuote(dailyQuotes[index]);
    }
  }, [dailyQuotes]);
  
  return { quote };
}
