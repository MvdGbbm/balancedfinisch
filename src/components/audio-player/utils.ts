import { quotes } from "@/data/quotes";

export interface Quote {
  text: string;
  author: string;
}

export const validateAudioUrl = (url: string): string | null => {
  if (!url) return null;
  
  url = url.trim();
  
  // Remove any trailing query parameters or hash fragments for extension checking
  const baseUrl = url.split(/[?#]/)[0];
  
  const validExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.flac', '.mp4', '.webm'];
  const hasValidExtension = validExtensions.some(ext => baseUrl.toLowerCase().endsWith(ext));
  
  // Also consider URLs that might be direct streams without extensions
  const isLikelyStreamUrl = isStreamUrl(url);
  
  if (!hasValidExtension && !isLikelyStreamUrl) {
    // If URL doesn't end with a valid extension and doesn't look like a stream URL, 
    // it's likely invalid
    console.warn("URL doesn't have a valid audio extension:", url);
    return null;
  }
  
  // Ensure URL has a proper protocol
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  
  try {
    const validatedUrl = new URL(url).toString();
    return validatedUrl;
  } catch (e) {
    console.error("Invalid URL:", url, e);
    return null;
  }
};

export const isStreamUrl = (url: string): boolean => {
  // Common patterns for streaming URLs
  const streamPatterns = [
    /\bstream\b/i,
    /\blive\b/i,
    /\.m3u8/i,
    /\bshoutcast\b/i,
    /\bicecast\b/i,
    /\bradio\b/i,
    /\baudio\b/i,
    /\bbroadcast\b/i
  ];
  
  return streamPatterns.some(pattern => pattern.test(url));
};

export const getMimeType = (url: string): string => {
  if (!url) return "audio/mpeg"; // Default
  
  const extension = url.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'ogg':
      return 'audio/ogg';
    case 'aac':
      return 'audio/aac';
    case 'm4a':
      return 'audio/mp4';
    case 'flac':
      return 'audio/flac';
    case 'mp4':
      return 'audio/mp4';
    case 'webm':
      return 'audio/webm';
    default:
      return 'audio/mpeg'; // Default to MP3
  }
};

export const getAudioMimeType = getMimeType;

export const checkUrlExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return true; // With no-cors we can't really check the status
  } catch (error) {
    console.error("Error checking URL existence:", error);
    return false;
  }
};

export const getRandomQuote = (): Quote => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};

export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return "00:00";
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const preloadAudio = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!url) {
      console.warn("Empty URL passed to preloadAudio");
      resolve(false);
      return;
    }
    
    const validatedUrl = validateAudioUrl(url);
    if (!validatedUrl) {
      console.warn("Invalid URL passed to preloadAudio:", url);
      resolve(false);
      return;
    }
    
    // Skip example.com URLs (placeholders)
    if (validatedUrl.includes('example.com')) {
      console.warn("Placeholder URL detected in preloadAudio:", validatedUrl);
      resolve(false);
      return;
    }
    
    console.log("Attempting to preload audio:", validatedUrl);
    
    const audio = new Audio();
    
    // Set a timeout for loading
    const timeout = setTimeout(() => {
      console.warn("Audio preload timed out:", validatedUrl);
      audio.removeAttribute('src');
      audio.load();
      resolve(false);
    }, 8000); // 8 seconds timeout for slower connections
    
    // Event listeners for success/failure
    audio.oncanplaythrough = () => {
      clearTimeout(timeout);
      console.log("Audio preload successful:", validatedUrl);
      audio.removeAttribute('src');
      audio.load();
      resolve(true);
    };
    
    audio.onerror = () => {
      clearTimeout(timeout);
      console.error("Error preloading audio:", validatedUrl);
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
    
    // Try loading the audio
    try {
      audio.src = validatedUrl;
      audio.load();
    } catch (e) {
      clearTimeout(timeout);
      console.error("Exception loading audio:", e);
      resolve(false);
    }
  });
};

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
