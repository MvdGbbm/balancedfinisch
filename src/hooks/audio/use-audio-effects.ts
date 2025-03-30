
import { useEffect } from "react";
import { CROSSFADE_DURATION } from "./types";

export const useAudioEffects = ({
  state,
  audioRef,
  nextAudioRef,
  audioUrl,
  nextAudioUrl,
  crossfadeTimeoutRef,
  onCrossfadeStart,
  onEnded,
  setIsCrossfading,
  setCurrentTime,
  volume
}) => {
  // Effect: Initialize audio element
  useEffect(() => {
    if (!audioRef.current) return;
    
    // Set initial volume
    audioRef.current.volume = volume;
    
    // Initialize next audio if available
    if (nextAudioRef.current && nextAudioUrl) {
      nextAudioRef.current.volume = 0;
      nextAudioRef.current.loop = state.isLooping;
    }
  }, [audioRef, nextAudioRef, nextAudioUrl, state.isLooping, volume]);
  
  // Effect: Handle crossfade when current audio is about to end
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !nextAudioUrl || !nextAudioRef.current) return;
    
    // Skip for live streams
    if (state.isLiveStream) return;
    
    // If audio is playing and has a duration 
    if (state.isPlaying && state.duration > 0 && !state.isLooping) {
      const timeRemaining = state.duration - state.currentTime;
      
      // If we're close to the end and should start crossfade
      if (timeRemaining <= CROSSFADE_DURATION && timeRemaining > 0) {
        // Start crossfade
        if (!state.isCrossfading) {
          console.log("Starting crossfade to next audio");
          setIsCrossfading(true);
          
          if (onCrossfadeStart) {
            onCrossfadeStart();
          }
          
          // Start playing the next audio
          const nextAudio = nextAudioRef.current;
          nextAudio.src = nextAudioUrl;
          nextAudio.volume = 0;
          nextAudio.currentTime = 0;
          nextAudio.loop = state.isLooping;
          
          // Attempt to play the next audio
          nextAudio.play().catch(error => {
            console.error("Error playing next audio during crossfade:", error);
            setIsCrossfading(false);
          });
          
          // Gradually fade out current audio and fade in next audio
          const startTime = performance.now();
          const fadeDuration = timeRemaining * 1000;
          
          const fadeStep = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / fadeDuration, 1);
            
            if (audio && !audio.paused) {
              audio.volume = volume * (1 - progress);
            }
            
            if (nextAudio && !nextAudio.paused) {
              nextAudio.volume = volume * progress;
            }
            
            if (progress < 1) {
              // Continue fading
              crossfadeTimeoutRef.current = window.setTimeout(fadeStep, 50);
            } else {
              // Fade complete
              if (audio) {
                audio.pause();
                setCurrentTime(0);
              }
              
              // Swap audio elements
              if (nextAudio) {
                nextAudio.volume = volume;
              }
              
              setIsCrossfading(false);
              
              // Call onEnded handler if provided
              if (onEnded) {
                onEnded();
              }
            }
          };
          
          // Start fadeStep
          fadeStep();
        }
      }
    }
  }, [
    audioRef,
    nextAudioRef,
    state.isPlaying,
    state.duration,
    state.currentTime,
    state.isLooping,
    state.isCrossfading,
    state.isLiveStream,
    nextAudioUrl,
    volume,
    crossfadeTimeoutRef,
    onCrossfadeStart,
    onEnded,
    setIsCrossfading,
    setCurrentTime
  ]);
  
  // Effect: Update audio src when URL changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (audioUrl && audio.src !== audioUrl) {
      console.log("Audio URL changed, updating src:", audioUrl);
      audio.src = audioUrl;
      audio.load();
    }
  }, [audioRef, audioUrl]);
};
