
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
  onCanPlay?: () => void;
}

export const AudioElement: React.FC<AudioElementProps> = ({ 
  audioRef, 
  src, 
  autoPlay = false,
  loop = false,
  volume = 1,
  onEnded,
  onError,
  onCanPlay
}) => {
  const initialized = useRef(false);
  const attemptedPlay = useRef(false);
  const lastPlayAttemptTime = useRef(0);

  useEffect(() => {
    if (!audioRef.current) return;

    // Set initial properties
    if (!initialized.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = loop;
      initialized.current = true;
      
      console.log('AudioElement initialized with properties:', {
        volume,
        loop,
        src: src || '[none]'
      });
      
      // Add event listeners
      if (onEnded) {
        audioRef.current.addEventListener('ended', onEnded);
      }
      
      if (onError) {
        audioRef.current.addEventListener('error', (e) => onError(e as ErrorEvent));
      }

      if (onCanPlay) {
        audioRef.current.addEventListener('canplay', onCanPlay);
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
      
      // Reset audio element
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      // Set new source
      audioRef.current.src = src;
      audioRef.current.load();
      attemptedPlay.current = false;
    }
    
    // Auto play if needed and we haven't tried recently
    if (autoPlay && src && !attemptedPlay.current) {
      const now = Date.now();
      
      // Don't retry too frequently (prevent spamming the browser with play requests)
      if (now - lastPlayAttemptTime.current > 1000) {
        attemptedPlay.current = true;
        lastPlayAttemptTime.current = now;
        
        console.log('Attempting to auto-play audio:', src);
        
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Auto-play succeeded for:', src);
          }).catch(error => {
            console.error('Error auto-playing audio:', error);
            
            // Show user-friendly error message for autoplay issues
            if (error.name === 'NotAllowedError') {
              toast.info("Autoplay is geblokkeerd. Interactie met de pagina is vereist om audio af te spelen.");
            } else if (error.name === 'AbortError') {
              // Common when quickly switching tracks, not usually a problem
              console.log('Audio play was aborted (normal during rapid track changes)');
            } else {
              toast.error("Er is een probleem met het afspelen van audio. Probeer te klikken op de afspeelknop.");
            }
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
        if (onCanPlay) {
          audioRef.current.removeEventListener('canplay', onCanPlay);
        }
        audioRef.current.removeEventListener('playing', () => {});
        audioRef.current.removeEventListener('waiting', () => {});
      }
    };
  }, [src, audioRef, autoPlay, loop, volume, onEnded, onError, onCanPlay]);

  return <audio ref={audioRef} style={{ display: 'none' }} />;
};

export default AudioElement;
