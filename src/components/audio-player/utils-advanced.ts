
// Advanced utility functions for the audio player

import { validateAudioUrl, getMimeType as getAudioMimeType } from "./utils";

// Check if browser supports AAC playback
export const checkAACSupport = (): boolean => {
  const audio = document.createElement('audio');
  return audio.canPlayType('audio/aac') !== '' || 
         audio.canPlayType('audio/mp4; codecs="mp4a.40.2"') !== '';
};

// Preload and test an audio URL
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
