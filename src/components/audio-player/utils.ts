
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

export const validateAudioUrl = (url: string | undefined): string => {
  if (!url) return '';
  
  // Remove any trailing or leading whitespace
  url = url.trim();
  
  // Test if the URL is already properly encoded or contains spaces
  const needsEncoding = url.includes(' ') || 
                        /%20/i.test(url) === false && 
                        /[\u00A0-\u9999]/g.test(url);
  
  // Only encode if not already encoded and contains special characters
  if (needsEncoding) {
    // First decode in case it's partially encoded
    try {
      url = decodeURI(url);
    } catch (e) {
      console.warn("Error decoding URL:", e);
      // Continue with original URL if decoding fails
    }
    
    // Then encode properly
    try {
      url = encodeURI(url);
    } catch (e) {
      console.warn("Error encoding URL:", e);
      // Continue with original URL if encoding fails
    }
  }
  
  // Ensure URL has valid protocol
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    // If it's a relative path, add leading slash
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
  }
  
  // Fix common encoding issues for special characters in filenames
  url = url.replace(/%20/g, '%20')  // Ensure spaces are encoded properly
           .replace(/\+/g, '%2B')   // Encode plus signs
           .replace(/#/g, '%23')    // Encode hash symbols
           .replace(/&/g, '%26');   // Encode ampersands
  
  console.log("Validated audio URL:", url);
  return url;
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
  
  // For URLs with special characters or spaces that might be used in voice files
  if (lowercaseUrl.includes('adem in') || 
      lowercaseUrl.includes('adem uit') || 
      lowercaseUrl.includes('vasthouden')) {
    return 'audio/mpeg';
  }
  
  // Default to general audio type
  return 'audio/mpeg';
};

// Validate that an audio file exists and is accessible
export const validateAudioFileExists = async (url: string): Promise<boolean> => {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error("Error validating audio file:", error);
    return false;
  }
};

// Pre-load audio to browser cache
export const preloadAudio = (url: string): void => {
  if (!url) return;
  
  try {
    const validatedUrl = validateAudioUrl(url);
    if (!validatedUrl) return;
    
    const audio = new Audio();
    audio.src = validatedUrl;
    audio.preload = 'auto';
    
    // Log any loading errors
    audio.addEventListener('error', (e) => {
      console.error("Error preloading audio:", e, "URL:", validatedUrl);
    });
    
    // Just trigger loading without playing
    audio.load();
    console.log("Preloading audio:", validatedUrl);
  } catch (e) {
    console.error("Error in preloadAudio:", e);
  }
};

// Special function for voice files with Dutch names
export const processVoiceAudioUrl = (url: string, phase: string): string => {
  if (!url) return '';
  
  // Process URL for special Dutch characters and spaces
  let processedUrl = validateAudioUrl(url);
  
  // Log for debugging
  console.log(`Processing voice audio for phase "${phase}": ${processedUrl}`);
  
  return processedUrl;
};
