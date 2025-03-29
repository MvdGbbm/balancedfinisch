
import { Quote } from "@/lib/types";
import { quotes } from "@/data/quotes";

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
