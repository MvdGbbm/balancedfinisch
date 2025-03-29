
import { useState, useEffect } from "react";
import { VoiceURLs } from "@/components/breathing-page/types";
import { defaultVoiceUrls } from "@/components/breathing-page/constants";
import { loadVoiceUrls } from "@/components/breathing-page/utils";

export function useVoiceConfig() {
  // Voice state
  const [veraVoiceUrls, setVeraVoiceUrls] = useState<VoiceURLs>(defaultVoiceUrls.vera);
  const [marcoVoiceUrls, setMarcoVoiceUrls] = useState<VoiceURLs>(defaultVoiceUrls.marco);
  const [voiceUrlsValidated, setVoiceUrlsValidated] = useState<boolean>(false);
  
  // Volume state
  const [voiceVolume, setVoiceVolume] = useState<number>(0.8);

  // Load voice URLs on initialization
  useEffect(() => {
    loadVoiceUrls(setVeraVoiceUrls, setMarcoVoiceUrls, defaultVoiceUrls, setVoiceUrlsValidated);
  }, []);

  const handleVoiceVolumeChange = (volume: number) => {
    setVoiceVolume(volume);
  };

  return {
    veraVoiceUrls,
    marcoVoiceUrls,
    voiceUrlsValidated,
    voiceVolume,
    setVeraVoiceUrls,
    setMarcoVoiceUrls,
    setVoiceUrlsValidated,
    handleVoiceVolumeChange
  };
}
