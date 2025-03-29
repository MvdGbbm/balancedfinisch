
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { VoiceUrls } from "../types";

export function useVoiceUrlLoader() {
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

  useEffect(() => {
    try {
      const savedVeraUrls = localStorage.getItem('veraVoiceUrls');
      if (savedVeraUrls) {
        const parsedUrls = JSON.parse(savedVeraUrls);
        console.log("Loaded Vera voice URLs:", parsedUrls);
        setVeraVoiceUrls(parsedUrls);
      } else {
        console.log("No Vera voice URLs found in localStorage");
      }
      
      const savedMarcoUrls = localStorage.getItem('marcoVoiceUrls');
      if (savedMarcoUrls) {
        const parsedUrls = JSON.parse(savedMarcoUrls);
        console.log("Loaded Marco voice URLs:", parsedUrls);
        setMarcoVoiceUrls(parsedUrls);
      } else {
        console.log("No Marco voice URLs found in localStorage");
      }
    } catch (error) {
      console.error("Error loading voice URLs from localStorage:", error);
      toast.error("Fout bij het laden van stem configuratie");
    }
  }, []);

  return {
    veraVoiceUrls,
    marcoVoiceUrls
  };
}
