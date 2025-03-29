
import React, { useEffect, useRef } from 'react';

interface AudioElementProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  src?: string;
  autoPlay?: boolean;
  loop?: boolean;
  volume?: number;
  onEnded?: () => void;
  onError?: (e: ErrorEvent) => void;
}

export const AudioElement: React.FC<AudioElementProps> = ({ 
  audioRef, 
  src, 
  autoPlay = false,
  loop = false,
  volume = 1,
  onEnded,
  onError
}) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!audioRef.current) return;

    // Set initial properties
    if (!initialized.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = loop;
      initialized.current = true;
      
      // Add event listeners
      if (onEnded) {
        audioRef.current.addEventListener('ended', onEnded);
      }
      
      if (onError) {
        audioRef.current.addEventListener('error', (e) => onError(e as ErrorEvent));
      }
    }

    // Update properties when they change
    audioRef.current.volume = volume;
    audioRef.current.loop = loop;

    // Update source if provided and different
    if (src && audioRef.current.src !== src) {
      console.log('Setting audio source:', src);
      audioRef.current.src = src;
      audioRef.current.load();
      
      if (autoPlay) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error playing audio:', error);
          });
        }
      }
    }

    return () => {
      if (audioRef.current) {
        if (onEnded) {
          audioRef.current.removeEventListener('ended', onEnded);
        }
        if (onError) {
          audioRef.current.removeEventListener('error', (e) => onError(e as ErrorEvent));
        }
      }
    };
  }, [src, audioRef, autoPlay, loop, volume, onEnded, onError]);

  return <audio ref={audioRef} style={{ display: 'none' }} />;
};

export default AudioElement;
