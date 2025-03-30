
/**
 * Utilities for handling quotes in the audio player
 */

/**
 * Returns a random quote about sound, music or listening
 */
export const getRandomQuote = (): { id: string; text: string; author: string; backgroundClass?: string } => {
  // Import quotes from data
  const { quotes, colorGradients } = require("@/data/quotes");
  
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomGradientIndex = Math.floor(Math.random() * colorGradients.length);
  
  const quote = quotes[randomIndex];
  
  // Ensure the quote has an id (use existing or generate)
  return {
    ...quote,
    id: quote.id || `quote-random-${Date.now()}`,
    backgroundClass: colorGradients[randomGradientIndex]
  };
};
