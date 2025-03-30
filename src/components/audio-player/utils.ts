import { toast } from "sonner";

/**
 * Validates and normalizes an audio URL
 */
export const validateAudioUrl = (url: string): string | null => {
  if (!url) return null;
  
  // Clean up URL
  url = url.trim();
  
  // Add https if protocol is missing
  if (!/^https?:\/\//i.test(url) && !url.startsWith('data:')) {
    url = 'https://' + url.replace(/^\/\//, '');
  }
  
  // Handle Supabase storage URLs
  if (url.includes('supabase.co')) {
    url = fixSupabaseStorageUrl(url);
  }
  
  return url;
};

/**
 * Checks if a URL is accessible
 * Returns a promise that resolves to true if the URL is accessible, false otherwise
 */
export const checkUrlExists = async (url: string): Promise<boolean> => {
  if (!url) return false;
  
  try {
    // For audio files, we use a HEAD request to check if they exist
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors' // This prevents CORS errors but limits response info
    }).catch(err => {
      console.warn("Error checking URL existence:", err);
      return null;
    });
    
    clearTimeout(timeoutId);
    
    // With no-cors, we can't reliably check status, so we assume success if no error
    return !!response;
    
  } catch (error) {
    console.warn("Error checking URL existence:", error);
    return false;
  }
};

/**
 * Checks if a URL points to a streaming resource
 */
export const isStreamUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Common streaming extensions and patterns
  const streamPatterns = [
    /\.m3u8$/i,
    /\.mpd$/i,
    /\bstream\b/i,
    /\blive\b/i,
    /\bradio\b/i,
    /\bshoutcast\b/i,
    /\bicecast\b/i
  ];
  
  return streamPatterns.some(pattern => pattern.test(url));
};

/**
 * Formats time in seconds to MM:SS format
 */
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Gets MIME type based on audio URL extension
 */
export const getAudioMimeType = (url: string): string => {
  if (!url) return 'audio/mpeg';
  
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.endsWith('.mp3')) return 'audio/mpeg';
  if (lowerUrl.endsWith('.wav')) return 'audio/wav';
  if (lowerUrl.endsWith('.ogg')) return 'audio/ogg';
  if (lowerUrl.endsWith('.aac')) return 'audio/aac';
  if (lowerUrl.endsWith('.m4a')) return 'audio/mp4';
  if (lowerUrl.endsWith('.flac')) return 'audio/flac';
  
  // Default to MP3 if unknown
  return 'audio/mpeg';
};

/**
 * Checks if file is AAC format
 */
export const isAACFile = (url: string): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.endsWith('.aac') || lowerUrl.endsWith('.m4a');
};

/**
 * Fixes Supabase storage URLs to ensure proper format
 */
export const fixSupabaseStorageUrl = (url: string): string => {
  if (!url) return url;
  
  // Remove double slashes in path (except after protocol)
  url = url.replace(/(https?:\/\/)([^/]*)\/\/+/g, '$1$2/');
  
  // Ensure correct public URL format
  if (url.includes('supabase.co') && url.includes('/storage/v1/object/public/')) {
    // URL is already in the correct format
    return url;
  }
  
  if (url.includes('supabase.co') && url.includes('/storage/v1/object/')) {
    // Convert internal URL to public URL
    return url.replace('/storage/v1/object/', '/storage/v1/object/public/');
  }
  
  return url;
};

/**
 * Attempts to preload audio and verifies if it can be played
 * Returns a promise that resolves to true if audio is playable, false otherwise
 */
export const preloadAudio = async (url: string): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    
    try {
      const audio = new Audio();
      let timeoutId: number | null = null;
      
      // Set up timeout to catch hanging requests
      timeoutId = window.setTimeout(() => {
        console.warn('Audio preload timed out for:', url);
        audio.src = '';
        audio.removeEventListener('loadeddata', onSuccess);
        audio.removeEventListener('canplaythrough', onSuccess);
        audio.removeEventListener('error', onError);
        resolve(false);
      }, 8000); // 8 second timeout
      
      const clearHandlers = () => {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        audio.removeEventListener('loadeddata', onSuccess);
        audio.removeEventListener('canplaythrough', onSuccess);
        audio.removeEventListener('error', onError);
      };
      
      const onSuccess = () => {
        clearHandlers();
        console.log('Audio preloaded successfully:', url);
        resolve(true);
      };
      
      const onError = (e: Event) => {
        clearHandlers();
        console.error('Audio preload failed:', url, e);
        resolve(false);
      };
      
      audio.addEventListener('loadeddata', onSuccess);
      audio.addEventListener('canplaythrough', onSuccess);
      audio.addEventListener('error', onError);
      
      // Start loading the audio
      audio.src = url;
      audio.load();
      
    } catch (error) {
      console.error('Exception during audio preload:', error);
      resolve(false);
    }
  });
};

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
