
import { MutableRefObject } from "react";
import { validateAudioUrl as validatorFunction, isStreamUrl } from "@/components/audio-player/utils";

export const validateAudioUrl = validatorFunction;

export const checkIfLiveStream = (url: string): boolean => {
  return isStreamUrl(url);
};

export const checkAACSupport = (): boolean => {
  const audio = document.createElement('audio');
  return audio.canPlayType('audio/aac') !== '' || 
         audio.canPlayType('audio/mp4; codecs="mp4a.40.2"') !== '';
};

export const playDirectly = (
  url: string, 
  audioElement: HTMLAudioElement,
  retryCountRef: MutableRefObject<number>,
  setLoadError: (value: boolean) => void,
  onError?: () => void,
  setIsPlaying?: (value: boolean) => void,
  onPlayPauseChange?: (isPlaying: boolean) => void
) => {
  if (!audioElement) {
    console.error("Audio element not available");
    return;
  }
  
  url = validateAudioUrl(url) || '';
  if (!url) {
    console.error("Invalid audio URL");
    setLoadError(true);
    if (onError) onError();
    return;
  }
  
  console.log("Playing directly:", url);
  
  const isAAC = url.toLowerCase().endsWith('.aac') || 
                url.toLowerCase().endsWith('.m4a');
  
  const aacSupported = checkAACSupport();
  if (isAAC && !aacSupported) {
    console.warn("This browser might not support AAC format natively. Attempting to play anyway.");
  }
  
  const potentialLiveStream = checkIfLiveStream(url);
  
  setLoadError(false);
  
  audioElement.src = url;
  
  if (isAAC) {
    try {
      const source = document.createElement('source');
      source.src = url;
      source.type = url.toLowerCase().endsWith('.aac') ? 'audio/aac' : 'audio/mp4';
      
      audioElement.innerHTML = '';
      audioElement.appendChild(source);
      console.log("Added source element with type:", source.type);
    } catch (e) {
      console.warn("Couldn't add source element, falling back to basic src attribute", e);
      audioElement.src = url;
    }
  }
  
  audioElement.load();
  
  const onCanPlay = () => {
    console.log("Audio can play now:", url);
    
    audioElement.play()
      .then(() => {
        console.log("Audio playing successfully:", url);
        if (setIsPlaying) setIsPlaying(true);
        if (onPlayPauseChange) onPlayPauseChange(true);
        retryCountRef.current = 0;
      })
      .catch(error => {
        console.error("Error playing direct URL:", error);
        setLoadError(true);
        if (onError) onError();
      });
    audioElement.removeEventListener('canplay', onCanPlay);
  };
  
  audioElement.addEventListener('canplay', onCanPlay);
  
  const handleDirectError = (e: Event) => {
    console.error("Direct play error:", e);
    setLoadError(true);
    if (onError) onError();
    audioElement.removeEventListener('error', handleDirectError);
  };
  
  audioElement.addEventListener('error', handleDirectError);
};
