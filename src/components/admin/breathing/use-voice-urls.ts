
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { VoiceURLs } from "./types";

const defaultVoiceUrls: Record<string, VoiceURLs> = {
  vera: {
    start: "",
    inhale: "",
    hold: "",
    exhale: ""
  },
  marco: {
    start: "",
    inhale: "",
    hold: "",
    exhale: ""
  }
};

export function useVoiceUrls() {
  const [veraVoiceUrls, setVeraVoiceUrls] = useState<VoiceURLs>(defaultVoiceUrls.vera);
  const [marcoVoiceUrls, setMarcoVoiceUrls] = useState<VoiceURLs>(defaultVoiceUrls.marco);

  useEffect(() => {
    loadVoiceUrls();
  }, []);

  const loadVoiceUrls = () => {
    // Load Vera voice URLs
    const savedVeraUrls = localStorage.getItem('veraVoiceUrls');
    if (savedVeraUrls) {
      try {
        const parsedUrls = JSON.parse(savedVeraUrls);
        setVeraVoiceUrls(parsedUrls);
      } catch (error) {
        console.error("Error loading Vera voice URLs:", error);
        setVeraVoiceUrls(defaultVoiceUrls.vera);
      }
    }
    
    // Load Marco voice URLs
    const savedMarcoUrls = localStorage.getItem('marcoVoiceUrls');
    if (savedMarcoUrls) {
      try {
        const parsedUrls = JSON.parse(savedMarcoUrls);
        setMarcoVoiceUrls(parsedUrls);
      } catch (error) {
        console.error("Error loading Marco voice URLs:", error);
        setMarcoVoiceUrls(defaultVoiceUrls.marco);
      }
    }
  };

  const saveVeraVoiceUrls = (urls: VoiceURLs) => {
    setVeraVoiceUrls(urls);
    localStorage.setItem('veraVoiceUrls', JSON.stringify(urls));
    toast.success("Vera stem configuratie opgeslagen");
  };

  const saveMarcoVoiceUrls = (urls: VoiceURLs) => {
    setMarcoVoiceUrls(urls);
    localStorage.setItem('marcoVoiceUrls', JSON.stringify(urls));
    toast.success("Marco stem configuratie opgeslagen");
  };

  return {
    veraVoiceUrls,
    marcoVoiceUrls,
    saveVeraVoiceUrls,
    saveMarcoVoiceUrls
  };
}
