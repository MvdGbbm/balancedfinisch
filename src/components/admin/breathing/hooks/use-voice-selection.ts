
import { useState, useEffect } from "react";
import { VoiceURLs } from "../types";

export function useVoiceSelection() {
  const [activeVoice, setActiveVoice] = useState<"vera" | "marco" | null>(null);
  const [veraVoiceUrls, setVeraVoiceUrls] = useState<VoiceURLs>({
    inhale: "",
    hold: "",
    exhale: ""
  });
  const [marcoVoiceUrls, setMarcoVoiceUrls] = useState<VoiceURLs>({
    inhale: "",
    hold: "",
    exhale: ""
  });

  // Load voice URLs from localStorage
  useEffect(() => {
    const savedVeraUrls = localStorage.getItem('veraVoiceUrls');
    if (savedVeraUrls) {
      try {
        const parsedUrls = JSON.parse(savedVeraUrls);
        setVeraVoiceUrls(parsedUrls);
      } catch (error) {
        console.error("Error loading Vera voice URLs:", error);
      }
    }
    
    const savedMarcoUrls = localStorage.getItem('marcoVoiceUrls');
    if (savedMarcoUrls) {
      try {
        const parsedUrls = JSON.parse(savedMarcoUrls);
        setMarcoVoiceUrls(parsedUrls);
      } catch (error) {
        console.error("Error loading Marco voice URLs:", error);
      }
    }
  }, []);

  // Function to start with Vera voice
  const startWithVera = (isActive: boolean) => {
    if (isActive && activeVoice === "vera") {
      setActiveVoice(null);
    } else {
      setActiveVoice("vera");
    }
  };

  // Function to start with Marco voice
  const startWithMarco = (isActive: boolean) => {
    if (isActive && activeVoice === "marco") {
      setActiveVoice(null);
    } else {
      setActiveVoice("marco");
    }
  };

  return {
    activeVoice,
    setActiveVoice,
    veraVoiceUrls,
    marcoVoiceUrls,
    startWithVera,
    startWithMarco
  };
}
