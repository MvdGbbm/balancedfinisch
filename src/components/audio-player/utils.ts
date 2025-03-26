
import { quotes } from "@/data/quotes";
import { DailyQuote } from "@/lib/types";

export const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";
  
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const getRandomQuote = (): DailyQuote => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return {
    id: `quote-${randomIndex}`,
    text: quotes[randomIndex].text,
    author: quotes[randomIndex].author
  };
};

// Format duration from milliseconds to friendly string
export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${seconds} seconden`;
  } else if (minutes === 1) {
    return remainingSeconds > 0 
      ? `1 minuut en ${remainingSeconds} seconden` 
      : '1 minuut';
  } else {
    return remainingSeconds > 0 
      ? `${minutes} minuten en ${remainingSeconds} seconden` 
      : `${minutes} minuten`;
  }
};

// Get appropriate color class based on a string ID
export const getColorClassFromId = (id: string): string => {
  const colors = [
    'blue', 'indigo', 'purple', 'pink', 'rose', 
    'orange', 'amber', 'yellow', 'lime', 'green', 
    'emerald', 'teal', 'cyan'
  ];
  
  // Simple hash function to determine index
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % colors.length;
  
  return colors[colorIndex];
};
