
/**
 * Utilities for preloading and testing audio
 */

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
