
import { useRef } from "react";

export function useAudioValidation() {
  const SUPPORTED_FORMATS = [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 
    'audio/aac', 'audio/mp4', 'audio/m4a', 'audio/x-m4a'
  ];
  
  const aacSupported = useRef(checkAACSupport());

  function checkAACSupport() {
    const audio = document.createElement('audio');
    return audio.canPlayType('audio/aac') !== '' || 
           audio.canPlayType('audio/mp4; codecs="mp4a.40.2"') !== '';
  }

  function validateAudioUrl(url: string): string | null {
    if (!url || typeof url !== 'string') {
      console.warn("Invalid URL: URL is null, undefined, or not a string.");
      return null;
    }
    
    const trimmedUrl = url.trim();
    
    if (trimmedUrl === '') {
      console.warn("Invalid URL: URL is an empty string.");
      return null;
    }
    
    try {
      const urlObject = new URL(trimmedUrl);
      
      if (!['http:', 'https:'].includes(urlObject.protocol)) {
        console.warn("Invalid URL: URL must start with 'http://' or 'https://'.");
        return null;
      }
      
      if (!urlObject.hostname) {
        console.warn("Invalid URL: URL must have a valid hostname.");
        return null;
      }
      
      return trimmedUrl;
    } catch (error) {
      console.error("Invalid URL:", error);
      return null;
    }
  }

  function isStreamUrl(url: string): boolean {
    if (!url) return false;
    
    const lowercaseUrl = url.toLowerCase();
    return lowercaseUrl.includes('stream') || 
          lowercaseUrl.includes('radio') || 
          lowercaseUrl.includes('live') || 
          lowercaseUrl.includes('/live/') ||
          url.includes('.m3u8') ||
          url.includes('.pls');
  }

  return {
    validateAudioUrl,
    isStreamUrl,
    aacSupported,
    SUPPORTED_FORMATS
  };
}
