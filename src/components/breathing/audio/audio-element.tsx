
import React, { useEffect, useRef } from 'react';
import { toast } from "sonner";

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
  const attemptedPlay = useRef(false);

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

      // Add play feedback event listeners
      audioRef.current.addEventListener('playing', () => {
        console.log('Audio started playing:', src);
      });

      audioRef.current.addEventListener('waiting', () => {
        console.log('Audio buffering:', src);
      });
    }

    // Update properties when they change
    audioRef.current.volume = volume;
    audioRef.current.loop = loop;

    // Update source if provided and different
    if (src && audioRef.current.src !== src) {
      console.log('Setting audio source:', src);
      audioRef.current.src = src;
      audioRef.current.load();
      attemptedPlay.current = false;
    }
    
    // Auto play if needed and we haven't tried yet
    if (autoPlay && src && !attemptedPlay.current) {
      attemptedPlay.current = true;
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing audio:', error);
          
          // Show user-friendly error message for autoplay issues
          if (error.name === 'NotAllowedError') {
            toast.info("Autoplay is blocked. Click the play button to start audio.");
          } else {
            toast.error("Er is een probleem met het afspelen van audio.");
          }
        });
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
        audioRef.current.removeEventListener('playing', () => {});
        audioRef.current.removeEventListener('waiting', () => {});
      }
    };
  }, [src, audioRef, autoPlay, loop, volume, onEnded, onError]);

  return <audio ref={audioRef} style={{ display: 'none' }} />;
};

export default AudioElement;
