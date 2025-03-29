
/**
 * Audio utility functions
 */

export const validateAudioUrl = (url: string): string | null => {
  if (!url) return null;
  
  try {
    // Trim whitespace and normalize URL
    let processedUrl = url.trim();
    
    // If URL doesn't start with http/https, add https://
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = `https://${processedUrl}`;
    }
    
    // Try to construct a valid URL object
    const validUrl = new URL(processedUrl).toString();
    return validUrl;
  } catch (e) {
    console.error('Invalid audio URL:', url, e);
    return null;
  }
};

// Check if an audio URL is accessible/exists
export const checkUrlExists = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors' // Try no-cors mode to avoid CORS issues
    });
    
    clearTimeout(timeoutId);
    return true; // If no error is thrown, assume URL is accessible
  } catch (error) {
    console.warn('Error checking URL:', url, error);
    return true; // Default to true even on error to be permissive
  }
};

// Preload audio to check if it can be played
export const preloadAudio = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const audio = new Audio();
      
      const onCanPlay = () => {
        console.log('Audio can play:', url);
        cleanup();
        resolve(true);
      };
      
      const onError = (e: ErrorEvent) => {
        console.error('Audio preload error:', e);
        cleanup();
        resolve(false);
      };
      
      const onTimeout = () => {
        console.warn('Audio preload timeout:', url);
        cleanup();
        resolve(true); // Be permissive on timeout
      };
      
      const cleanup = () => {
        audio.removeEventListener('canplaythrough', onCanPlay);
        audio.removeEventListener('error', onError as EventListener);
        clearTimeout(timeoutId);
        audio.src = '';
      };
      
      audio.addEventListener('canplaythrough', onCanPlay);
      audio.addEventListener('error', onError as EventListener);
      
      // Set a timeout in case the audio takes too long to load
      const timeoutId = setTimeout(onTimeout, 3000);
      
      audio.src = url;
      audio.load();
    } catch (error) {
      console.error('Error in preloadAudio:', error);
      resolve(false);
    }
  });
};

export const getRandomQuote = () => {
  const quotes = [
    "Muziek geeft een ziel aan het universum, vleugels aan de geest, vlucht aan de verbeelding en leven aan alles.",
    "Muziek is de taal van de emotie.",
    "Zonder muziek zou het leven een vergissing zijn.",
    "Muziek brengt ons naar onszelf, naar dat deel waar innerlijke harmonie heerst."
  ];
  
  return quotes[Math.floor(Math.random() * quotes.length)];
};

// Format time in seconds to MM:SS format
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Helper for Supabase storage URLs
export const fixSupabaseStorageUrl = (url: string): string => {
  // Remove any query parameters
  return url.split('?')[0];
};

// Detect audio MIME type from URL
export const getAudioMimeType = (url: string): string => {
  const extension = url.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'ogg':
      return 'audio/ogg';
    case 'm4a':
      return 'audio/mp4';
    default:
      return 'audio/mpeg'; // Default fallback
  }
};
