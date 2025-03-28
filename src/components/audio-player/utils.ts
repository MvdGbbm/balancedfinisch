import { quotes, colorGradients } from "@/data/quotes";

export const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";
  
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomGradientIndex = Math.floor(Math.random() * colorGradients.length);
  return {
    ...quotes[randomIndex],
    backgroundClass: colorGradients[randomGradientIndex]
  };
};

/**
 * Validates and fixes audio URLs to ensure proper format
 */
export const validateAudioUrl = (url: string): string => {
  if (!url) return "";
  
  try {
    // Check if the URL has multiple protocol prefixes (e.g., https://https://)
    const protocolRegex = /^(https?:\/\/)+/i;
    const protocolMatch = url.match(protocolRegex);
    
    if (protocolMatch && protocolMatch[0] !== 'http://' && protocolMatch[0] !== 'https://') {
      // Fix double/triple protocols by keeping only one https:// prefix
      url = url.replace(protocolRegex, 'https://');
    }
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Create URL object to validate (will throw if invalid)
    new URL(url);
    
    return url;
  } catch (error) {
    console.error("Invalid URL format:", url, error);
    // Return original URL if we can't parse it
    return url;
  }
};

export const isStreamUrl = (url: string): boolean => {
  return url.includes('stream') || 
         url.includes('radio') || 
         url.includes('live') || 
         url.endsWith('.m3u8') || 
         url.includes('icecast') || 
         url.includes('shoutcast');
};

// Check if file is likely an AAC audio file
export const isAACFile = (url: string): boolean => {
  const lowercaseUrl = url.toLowerCase();
  return lowercaseUrl.endsWith('.aac') || 
         lowercaseUrl.endsWith('.m4a') || 
         lowercaseUrl.includes('audio/aac') || 
         lowercaseUrl.includes('audio/mp4a');
};

// Check if browser supports AAC playback
export const checkAACSupport = (): boolean => {
  const audio = document.createElement('audio');
  return audio.canPlayType('audio/aac') !== '' || 
         audio.canPlayType('audio/mp4; codecs="mp4a.40.2"') !== '';
};

// Get appropriate MIME type based on file extension
export const getAudioMimeType = (url: string): string => {
  const lowercaseUrl = url.toLowerCase();
  
  if (lowercaseUrl.endsWith('.aac')) return 'audio/aac';
  if (lowercaseUrl.endsWith('.m4a') || lowercaseUrl.endsWith('.mp4a')) return 'audio/mp4';
  if (lowercaseUrl.endsWith('.mp3')) return 'audio/mpeg';
  if (lowercaseUrl.endsWith('.wav')) return 'audio/wav';
  if (lowercaseUrl.endsWith('.ogg')) return 'audio/ogg';
  if (lowercaseUrl.endsWith('.flac')) return 'audio/flac';
  
  // Default to general audio type
  return 'audio/mpeg';
};

// Preload and test an audio URL
export const preloadAudio = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    
    const validatedUrl = validateAudioUrl(url);
    if (!validatedUrl) {
      resolve(false);
      return;
    }
    
    const audio = new Audio();
    
    // Set a timeout for loading
    const timeout = setTimeout(() => {
      console.warn("Audio preload timed out:", validatedUrl);
      resolve(false);
    }, 5000);
    
    // Event listeners for success/failure
    audio.oncanplaythrough = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    
    audio.onerror = (error) => {
      clearTimeout(timeout);
      console.error("Error preloading audio:", error, validatedUrl);
      resolve(false);
    };
    
    audio.src = validatedUrl;
    audio.load();
  });
};
