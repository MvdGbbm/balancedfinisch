
import { Soundscape } from "@/lib/types";

// Utility functions for audio handling
export const validateAudioUrl = (url: string): string => {
  if (!url) return "";
  
  // Fix URLs that don't have a protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url.replace(/^\/\//, '');
  }
  
  return url;
};

export const getMimeType = (url: string): string => {
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
    default:
      return 'audio/mpeg'; // Default to MP3
  }
};

export const fixSupabaseStorageUrl = (url: string): string => {
  // Check if it's a Supabase storage URL
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    // Supabase storage URLs need special handling because they might be signed
    return url;
  }
  return url;
};

export const preloadAudio = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const audio = new Audio();
      
      // Set up listeners to resolve the promise
      audio.oncanplaythrough = () => {
        resolve(true);
        audio.oncanplaythrough = null;
        audio.onerror = null;
        audio.src = '';
      };
      
      audio.onerror = () => {
        console.error("Error preloading audio:", url);
        resolve(false);
        audio.oncanplaythrough = null;
        audio.onerror = null;
        audio.src = '';
      };
      
      // Set a timeout in case the audio takes too long to load
      const timeout = setTimeout(() => {
        audio.oncanplaythrough = null;
        audio.onerror = null;
        audio.src = '';
        resolve(false);
      }, 5000);
      
      // Start loading the audio
      audio.src = url;
      audio.load();
      
      return () => {
        clearTimeout(timeout);
      };
    } catch (error) {
      console.error("Error in preloadAudio:", error);
      resolve(false);
    }
  });
};

export const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return "0:00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getAudioMimeType = (url: string): string => {
  return getMimeType(url);
};
