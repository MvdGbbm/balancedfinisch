
import { useRef, useEffect } from 'react';

export function useAudioContext(audioElement: HTMLAudioElement | null, isActive: boolean = true) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const isConnectedRef = useRef<boolean>(false);

  // Create or get the existing audio context
  const getContext = () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  };

  // Connect the audio element to the context
  const connectSource = (element: HTMLAudioElement) => {
    if (!element || isConnectedRef.current) return null;
    
    try {
      const context = getContext();
      sourceNodeRef.current = context.createMediaElementSource(element);
      isConnectedRef.current = true;
      return sourceNodeRef.current;
    } catch (error) {
      console.error("Error connecting audio source:", error);
      return null;
    }
  };

  // Disconnect the source node
  const disconnectSource = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch (error) {
        // Already disconnected or other error
        console.log("Source already disconnected or error:", error);
      }
      isConnectedRef.current = false;
    }
  };

  // Clean up function
  useEffect(() => {
    return () => {
      disconnectSource();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
      isConnectedRef.current = false;
    };
  }, []);

  return {
    getContext,
    connectSource,
    disconnectSource,
    isConnected: isConnectedRef.current,
    sourceNode: sourceNodeRef.current,
    audioContext: audioContextRef.current
  };
}
