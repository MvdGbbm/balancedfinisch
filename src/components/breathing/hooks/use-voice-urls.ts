
import { useState, useEffect } from "react";
import { VoiceUrls } from "../types/exercise-types";

export function useVoiceUrls() {
  const [veraVoiceUrls, setVeraVoiceUrls] = useState<VoiceUrls>({
    inhale: "",
    hold: "",
    exhale: ""
  });
  
  const [marcoVoiceUrls, setMarcoVoiceUrls] = useState<VoiceUrls>({
    inhale: "",
    hold: "",
    exhale: ""
  });

  const loadVoiceUrls = () => {
    // Load Vera voice URLs from localStorage
    const savedVeraUrls = localStorage.getItem('veraVoiceUrls');
    if (savedVeraUrls) {
      try {
        const parsedUrls = JSON.parse(savedVeraUrls);
        setVeraVoiceUrls(parsedUrls);
      } catch (error) {
        console.error("Error loading Vera voice URLs:", error);
      }
    }
    
    // Load Marco voice URLs from localStorage
    const savedMarcoUrls = localStorage.getItem('marcoVoiceUrls');
    if (savedMarcoUrls) {
      try {
        const parsedUrls = JSON.parse(savedMarcoUrls);
        setMarcoVoiceUrls(parsedUrls);
      } catch (error) {
        console.error("Error loading Marco voice URLs:", error);
      }
    }
  };

  // Force reload voice URLs with timestamp to break cache
  const forceReloadVoiceUrls = () => {
    const timestamp = Date.now();
    
    if (veraVoiceUrls.inhale) {
      const updatedVeraUrls = { 
        ...veraVoiceUrls, 
        inhale: veraVoiceUrls.inhale.includes('?') 
          ? `${veraVoiceUrls.inhale.split('?')[0]}?_t=${timestamp}`
          : `${veraVoiceUrls.inhale}?_t=${timestamp}`
      };
      setVeraVoiceUrls(updatedVeraUrls);
    }
    
    if (marcoVoiceUrls.inhale) {
      const updatedMarcoUrls = { 
        ...marcoVoiceUrls, 
        inhale: marcoVoiceUrls.inhale.includes('?') 
          ? `${marcoVoiceUrls.inhale.split('?')[0]}?_t=${timestamp}`
          : `${marcoVoiceUrls.inhale}?_t=${timestamp}`
      };
      setMarcoVoiceUrls(updatedMarcoUrls);
    }
  };

  // Load voice URLs on initial render
  useEffect(() => {
    loadVoiceUrls();
  }, []);

  return {
    veraVoiceUrls,
    marcoVoiceUrls,
    loadVoiceUrls,
    forceReloadVoiceUrls
  };
}
