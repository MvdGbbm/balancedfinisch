
import { VoiceURLs } from './types';
import { toast } from 'sonner';
import { preloadAudio, validateAudioUrl } from '@/components/audio-player/utils';

export const loadVoiceUrls = async (setVeraVoiceUrls: React.Dispatch<React.SetStateAction<VoiceURLs>>, 
                                    setMarcoVoiceUrls: React.Dispatch<React.SetStateAction<VoiceURLs>>,
                                    defaultVoiceUrls: Record<string, VoiceURLs>,
                                    setVoiceUrlsValidated: React.Dispatch<React.SetStateAction<boolean>>) => {
  const savedVeraUrls = localStorage.getItem('veraVoiceUrls');
  if (savedVeraUrls) {
    try {
      const parsedUrls = JSON.parse(savedVeraUrls);
      
      const validatedUrls = {
        start: parsedUrls.start ? validateAudioUrl(parsedUrls.start) : "",
        inhale: parsedUrls.inhale ? validateAudioUrl(parsedUrls.inhale) : "",
        hold: parsedUrls.hold ? validateAudioUrl(parsedUrls.hold) : "",
        exhale: parsedUrls.exhale ? validateAudioUrl(parsedUrls.exhale) : ""
      };
      
      setVeraVoiceUrls(validatedUrls);
      console.log("Loaded Vera voice URLs:", validatedUrls);
      
      await validateAudioFiles(validatedUrls, 'vera');
    } catch (error) {
      console.error("Error loading Vera voice URLs:", error);
      setVeraVoiceUrls(defaultVoiceUrls.vera);
    }
  }
  
  const savedMarcoUrls = localStorage.getItem('marcoVoiceUrls');
  if (savedMarcoUrls) {
    try {
      const parsedUrls = JSON.parse(savedMarcoUrls);
      
      const validatedUrls = {
        start: parsedUrls.start ? validateAudioUrl(parsedUrls.start) : "",
        inhale: parsedUrls.inhale ? validateAudioUrl(parsedUrls.inhale) : "",
        hold: parsedUrls.hold ? validateAudioUrl(parsedUrls.hold) : "",
        exhale: parsedUrls.exhale ? validateAudioUrl(parsedUrls.exhale) : ""
      };
      
      setMarcoVoiceUrls(validatedUrls);
      console.log("Loaded Marco voice URLs:", validatedUrls);
      
      await validateAudioFiles(validatedUrls, 'marco');
    } catch (error) {
      console.error("Error loading Marco voice URLs:", error);
      setMarcoVoiceUrls(defaultVoiceUrls.marco);
    }
  }
  
  setVoiceUrlsValidated(true);
};

export const validateAudioFiles = async (urls: VoiceURLs, voice: string): Promise<boolean> => {
  const urlsToValidate = [urls.inhale, urls.hold, urls.exhale].filter(Boolean);
  
  if (urls.start) {
    urlsToValidate.push(urls.start);
  }
  
  if (urlsToValidate.length === 0) {
    console.log(`${voice} URLs are not complete, skipping validation`);
    return false;
  }
  
  console.log(`Validating ${voice} audio URLs...`);
  
  try {
    const validationPromises = urlsToValidate.map(url => preloadAudio(url));
    const validationResults = await Promise.all(validationPromises);
    
    const allValid = validationResults.every(result => result === true);
    
    if (allValid) {
      console.log(`All ${voice} audio files validated successfully`);
      return true;
    } else {
      console.error(`One or more ${voice} audio files failed validation`);
      return false;
    }
  } catch (error) {
    console.error(`Error validating ${voice} audio files:`, error);
    return false;
  }
};

export const handleActivateVoice = async (
  voice: "vera" | "marco",
  veraVoiceUrls: VoiceURLs,
  marcoVoiceUrls: VoiceURLs,
  selectedPattern: any,
  startAudioRef: React.RefObject<HTMLAudioElement>,
  setActiveVoice: React.Dispatch<React.SetStateAction<"vera" | "marco" | null>>,
  setIsExerciseActive: React.Dispatch<React.SetStateAction<boolean>>,
  setCurrentPhase: React.Dispatch<React.SetStateAction<any>>,
  setShowAnimation: React.Dispatch<React.SetStateAction<boolean>>,
  setCurrentCycle: React.Dispatch<React.SetStateAction<number>>,
  setExerciseCompleted: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const urls = voice === "vera" ? veraVoiceUrls : marcoVoiceUrls;
  
  if (!urls.inhale || !urls.exhale) {
    toast.error(`${voice === "vera" ? "Vera" : "Marco"} audio URL's ontbreken`);
    return;
  }
  
  const isValid = await validateAudioFiles(urls, voice);
  
  if (!isValid) {
    toast.error(`Fout bij validatie van ${voice === "vera" ? "Vera" : "Marco"} audio bestanden. Controleer of alle URL's correct zijn.`);
    return;
  }
  
  if (selectedPattern?.startUrl && startAudioRef.current) {
    startAudioRef.current.src = selectedPattern.startUrl;
    startAudioRef.current.load();
    
    try {
      await startAudioRef.current.play();
      console.log("Playing start audio:", selectedPattern.startUrl);
    } catch (error) {
      console.error("Error playing start audio:", error);
    }
  }
  
  setActiveVoice(voice);
  setIsExerciseActive(true);
  setCurrentPhase("start");
  setShowAnimation(true);
  setCurrentCycle(1);
  setExerciseCompleted(false);
  console.log(`Activated ${voice} voice with URLs:`, urls);
};
