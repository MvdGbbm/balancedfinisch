
import { 
  validateAudioUrl, 
  preloadAudio, 
  fixSupabaseStorageUrl, 
  completeUrlValidation 
} from "@/components/audio-player/utils";

export interface ValidationState {
  validatedUrl: string;
  isValidatingUrl: boolean;
  isUrlValid: boolean;
}

export const validateAndProcessAudioUrl = async (
  url: string, 
  setIsValidatingUrl: (isValidating: boolean) => void,
  setValidatedUrl: (url: string) => void,
  setIsUrlValid: (isValid: boolean) => void
): Promise<void> => {
  setIsValidatingUrl(true);
  
  try {
    // First validation of base URL
    const fixedUrl = validateAudioUrl(url);
    
    // Extra validation for Supabase URLs
    let finalUrl = fixedUrl;
    if (fixedUrl.includes('supabase.co')) {
      finalUrl = fixSupabaseStorageUrl(fixedUrl);
    }
    
    setValidatedUrl(finalUrl);
    
    // Check if the URL actually works
    const success = await preloadAudio(finalUrl);
    setIsUrlValid(success);
    
    if (success) {
      console.log("Audio URL successfully validated:", finalUrl);
    } else {
      console.warn("Audio URL validation failed:", finalUrl);
      
      // Try extra corrections for Supabase URLs
      if (finalUrl.includes('supabase.co')) {
        // Last attempt with extended validation
        const correctedUrl = await completeUrlValidation(url, true, 'soundscapes');
        if (correctedUrl) {
          setValidatedUrl(correctedUrl);
          const retrySuccess = await preloadAudio(correctedUrl);
          setIsUrlValid(retrySuccess);
          console.log("Revalidation result:", retrySuccess ? "Successful" : "Failed", correctedUrl);
        }
      }
    }
  } catch (error) {
    console.error("Error validating audio URL:", error);
    setIsUrlValid(false);
  } finally {
    setIsValidatingUrl(false);
  }
};

export const processUrl = (url: string): string => {
  if (!url) return "";
  
  // Add http if needed
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url.replace(/^\/\//, '');
  }
  
  return url;
};
