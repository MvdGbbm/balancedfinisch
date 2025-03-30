
import { useRef } from "react";

export const useFormatSupport = () => {
  const checkAACSupport = () => {
    const audio = document.createElement('audio');
    return audio.canPlayType('audio/aac') !== '' || 
           audio.canPlayType('audio/mp4; codecs="mp4a.40.2"') !== '';
  };
  
  const aacSupported = useRef(checkAACSupport());
  
  const SUPPORTED_FORMATS = [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 
    'audio/aac', 'audio/mp4', 'audio/m4a', 'audio/x-m4a'
  ];

  const checkIfLiveStream = (url: string) => {
    return url.includes('stream') || 
           url.includes('live') || 
           url.includes('radio') || 
           (url.includes('http') && !url.match(/\.(mp3|wav|ogg|aac|m4a)$/i));
  };

  return {
    aacSupported: aacSupported.current,
    SUPPORTED_FORMATS,
    checkIfLiveStream
  };
};
