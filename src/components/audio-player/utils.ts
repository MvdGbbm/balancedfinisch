import { DailyQuote } from "@/lib/types";
import { quotes, colorGradients } from "@/data/quotes";

export const validateAudioUrl = (url: string): string | null => {
  if (!url || typeof url !== 'string') {
    console.warn("Invalid URL: URL is null, undefined, or not a string.");
    return null;
  }
  
  const trimmedUrl = url.trim();
  
  if (trimmedUrl === '') {
    console.warn("Invalid URL: URL is an empty string.");
    return null;
  }
  
  try {
    const urlObject = new URL(trimmedUrl);
    
    if (!['http:', 'https:'].includes(urlObject.protocol)) {
      console.warn("Invalid URL: URL must start with 'http://' or 'https://'.");
      return null;
    }
    
    if (!urlObject.hostname) {
      console.warn("Invalid URL: URL must have a valid hostname.");
      return null;
    }
    
    return trimmedUrl;
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
};

export const checkUrlExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'cors' });
    
    if (response.ok) {
      return true;
    } else {
      console.warn(`URL check failed for ${url} with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`Error checking URL ${url}:`, error);
    return false;
  }
};

export const preloadAudio = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = url;
    audio.preload = 'auto';
    
    audio.addEventListener('canplaythrough', () => {
      resolve(true);
    });
    
    audio.addEventListener('error', () => {
      console.error("Failed to preload audio:", url);
      resolve(false);
    });
  });
};

// Add or update this function to ensure it always returns a quote with an id
export const getRandomQuote = (): DailyQuote => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomGradientIndex = Math.floor(Math.random() * colorGradients.length);
  
  // If no quotes are available, return a default quote with a generated id
  if (!quotes || quotes.length === 0) {
    return {
      id: `generated-${Date.now()}`,
      text: "Elke ademhaling is een nieuwe kans om te beginnen.",
      author: "Mindful",
      backgroundClass: colorGradients[randomGradientIndex] || "bg-gradient-to-br from-blue-500 to-purple-600"
    };
  }
  
  return {
    ...quotes[randomIndex],
    id: quotes[randomIndex].id || `quote-${randomIndex}`,
    backgroundClass: colorGradients[randomGradientIndex]
  };
};
