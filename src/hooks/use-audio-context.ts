
import { useRef, useEffect, useState, useCallback } from 'react';

export function useAudioContext(audioElement: HTMLAudioElement | null, isActive: boolean = true) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const hasAttemptedConnection = useRef(false);

  // Create or get the existing audio context
  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
        console.log('Created new AudioContext');
      } catch (error) {
        console.error('Failed to create AudioContext:', error);
      }
    }
    return audioContextRef.current;
  }, []);

  // Connect the audio element to the context
  const connectSource = useCallback((element: HTMLAudioElement) => {
    if (!element || isConnected || !isActive) return null;
    
    // Prevent multiple connection attempts for the same element
    if (hasAttemptedConnection.current) return sourceNodeRef.current;
    
    hasAttemptedConnection.current = true;
    
    try {
      const context = getContext();
      if (!context) return null;
      
      // Check if the context is in suspended state and resume it
      if (context.state === 'suspended') {
        context.resume().catch(console.error);
      }
      
      // Create source node if we don't have one yet
      if (!sourceNodeRef.current) {
        sourceNodeRef.current = context.createMediaElementSource(element);
        sourceNodeRef.current.connect(context.destination);
        console.log('Connected audio source to context');
      }
      
      setIsConnected(true);
      return sourceNodeRef.current;
    } catch (error) {
      console.error("Error connecting audio source:", error);
      return null;
    }
  }, [getContext, isConnected, isActive]);

  // Disconnect the source node
  const disconnectSource = useCallback(() => {
    if (sourceNodeRef.current && isConnected) {
      try {
        sourceNodeRef.current.disconnect();
        console.log('Disconnected audio source');
        setIsConnected(false);
      } catch (error) {
        // Already disconnected or other error
        console.log("Source already disconnected or error:", error);
      }
    }
  }, [isConnected]);

  // Connect source when audio element is available and active
  useEffect(() => {
    if (audioElement && isActive && !isConnected) {
      connectSource(audioElement);
    } else if (!isActive && isConnected) {
      disconnectSource();
    }
  }, [audioElement, isActive, isConnected, connectSource, disconnectSource]);

  // Clean up function
  useEffect(() => {
    return () => {
      disconnectSource();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
        console.log('Closed AudioContext');
      }
      setIsConnected(false);
      hasAttemptedConnection.current = false;
    };
  }, [disconnectSource]);

  return {
    getContext,
    connectSource,
    disconnectSource,
    isConnected,
    sourceNode: sourceNodeRef.current,
    audioContext: audioContextRef.current
  };
}
