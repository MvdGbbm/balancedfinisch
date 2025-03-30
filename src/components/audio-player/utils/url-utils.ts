
/**
 * Utilities for handling audio URLs
 */

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
