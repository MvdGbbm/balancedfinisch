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
    url = url.trim();
    
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
    
    // Remove trailing slashes before file extension
    url = url.replace(/\/+(\w+\.\w+)$/, '/$1');
    
    // Fix common typos in domain names
    url = url.replace(/([^:])\/\/+/g, '$1/');

    // Handle Supabase storage URLs
    if (url.includes('supabase.co/storage/v1/object/public')) {
      // Ensure the URL doesn't have double paths for storage
      url = url.replace(/(storage\/v1\/object\/public\/[^\/]+)\/+storage\/v1\/object\/public/, '$1');
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
  
  // For Supabase storage URLs, try to determine type from the path
  if (lowercaseUrl.includes('supabase.co/storage')) {
    if (lowercaseUrl.includes('.mp3')) return 'audio/mpeg';
    if (lowercaseUrl.includes('.aac')) return 'audio/aac';
    if (lowercaseUrl.includes('.m4a')) return 'audio/mp4';
    if (lowercaseUrl.includes('.wav')) return 'audio/wav';
    if (lowercaseUrl.includes('.ogg')) return 'audio/ogg';
    if (lowercaseUrl.includes('.flac')) return 'audio/flac';
  }
  
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
      audio.removeAttribute('src');
      audio.load();
      resolve(false);
    }, 8000); // Increase timeout to 8 seconds for slower connections
    
    // Event listeners for success/failure
    audio.oncanplaythrough = () => {
      clearTimeout(timeout);
      audio.removeAttribute('src');
      audio.load();
      resolve(true);
    };
    
    audio.onerror = (error) => {
      clearTimeout(timeout);
      console.error("Error preloading audio:", error, validatedUrl);
      audio.removeAttribute('src');
      audio.load();
      resolve(false);
    };
    
    // Add additional catches for network errors
    audio.addEventListener('stalled', () => {
      clearTimeout(timeout);
      console.warn("Audio load stalled:", validatedUrl);
      audio.removeAttribute('src');
      audio.load();
      resolve(false);
    });
    
    audio.addEventListener('abort', () => {
      clearTimeout(timeout);
      console.warn("Audio load aborted:", validatedUrl);
      audio.removeAttribute('src');
      audio.load();
      resolve(false);
    });
    
    // For Supabase URLs, add the storage path if missing
    let audioUrl = validatedUrl;
    if (audioUrl.includes('supabase.co') && !audioUrl.includes('/storage/v1/object/public/')) {
      try {
        const urlObj = new URL(audioUrl);
        if (!urlObj.pathname.includes('/storage/v1/object/public/')) {
          audioUrl = `${urlObj.origin}/storage/v1/object/public/music${urlObj.pathname}`;
          console.log("Corrected Supabase URL:", audioUrl);
        }
      } catch (e) {
        console.error("Error fixing Supabase URL:", e);
      }
    }
    
    audio.src = audioUrl;
    audio.load();
  });
};

// Check if a URL exists (can be loaded)
export const checkUrlExists = async (url: string): Promise<boolean> => {
  try {
    const validatedUrl = validateAudioUrl(url);
    if (!validatedUrl) return false;
    
    // For audio files, use preloadAudio
    if (/\.(mp3|ogg|wav|aac|m4a|flac)$/i.test(validatedUrl) || 
        validatedUrl.includes('supabase.co/storage')) {
      return await preloadAudio(validatedUrl);
    }
    
    // For other URLs, try a HEAD request with CORS proxy if needed
    try {
      const response = await fetch(validatedUrl, { 
        method: 'HEAD',
        mode: 'no-cors' // This prevents CORS errors but also means we can't check the status
      });
      
      // Since we used no-cors, we can't check the status
      // We'll assume it succeeded if we got here without an error
      return true;
    } catch (e) {
      console.error("Fetch check failed, trying preloadAudio as fallback:", e);
      return await preloadAudio(validatedUrl);
    }
  } catch (error) {
    console.error("Error checking if URL exists:", url, error);
    return false;
  }
};

// Fix Supabase storage URLs to ensure they have the correct format
export const fixSupabaseStorageUrl = (url: string): string => {
  if (!url || !url.includes('supabase.co')) return url;
  
  try {
    const urlObj = new URL(url);
    
    // If the URL already contains storage path, return it
    if (urlObj.pathname.includes('/storage/v1/object/public/')) {
      return url;
    }
    
    // Otherwise, add the storage path
    const fixedUrl = `${urlObj.origin}/storage/v1/object/public/music${urlObj.pathname}`;
    console.log("Fixed Supabase URL:", fixedUrl);
    return fixedUrl;
  } catch (e) {
    console.error("Error fixing Supabase URL:", e);
    return url;
  }
};
