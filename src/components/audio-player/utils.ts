
import { quotes } from "@/data/quotes";

export const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";
  
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};

export const validateAudioUrl = (url: string | undefined): string => {
  if (!url) return '';
  
  // Remove any trailing or leading whitespace
  url = url.trim();
  
  // Ensure URL has valid protocol
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    // If it's a relative path, add leading slash
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
  }
  
  return url;
};
