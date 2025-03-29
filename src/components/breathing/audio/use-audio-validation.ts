
import { toast } from 'sonner';
import { preloadAudio } from '@/components/audio-player/utils';

export interface VoiceUrls {
  start?: string;
  inhale: string;
  hold: string;
  exhale: string;
  end?: string;
}

export const useAudioValidation = () => {
  // Validate voice URLs to ensure they are playable
  const validateVoiceUrls = async (urls: VoiceUrls) => {
    if (!urls.inhale || !urls.exhale) {
      console.log("Voice URLs are incomplete, skipping validation");
      return false;
    }
    try {
      // Only validate URLs that are actually provided and will be used
      const urlsToValidate = [urls.inhale, urls.exhale].filter(Boolean);
      
      // Only add the hold URL to validation if it exists and is not empty
      if (urls.hold && urls.hold.trim() !== '') {
        urlsToValidate.push(urls.hold);
      }
      
      if (urls.start) {
        urlsToValidate.push(urls.start);
      }
      
      if (urls.end) {
        urlsToValidate.push(urls.end);
      }
      
      const validationPromises = urlsToValidate.map(url => preloadAudio(url));
      const validationResults = await Promise.all(validationPromises);
      
      const allValid = validationResults.every(result => result === true);
      
      if (!allValid) {
        console.error("One or more voice audio URLs failed validation");
        toast.error("Fout bij het laden van audio. Controleer of alle URL's correct zijn.");
        return false;
      }
      console.log("All voice URLs validated successfully");
      return true;
    } catch (error) {
      console.error("Error validating voice URLs:", error);
      return false;
    }
  };

  return { validateVoiceUrls };
};
