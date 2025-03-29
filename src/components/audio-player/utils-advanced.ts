
import { Soundscape } from "@/lib/types";
import { getMimeType } from "./utils";

// Advanced functions for audio processing

/**
 * Create an in-memory AudioContext for visualization and processing
 */
export function createAudioContext(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch (error) {
    console.error("AudioContext not supported", error);
    return null;
  }
}

/**
 * Connect a media element to an AudioContext for visualization
 */
export function connectAudioElementToContext(
  audioElement: HTMLAudioElement,
  audioContext: AudioContext
): {
  sourceNode: MediaElementAudioSourceNode;
  analyzerNode: AnalyserNode;
} {
  // Create an audio source from the audio element
  const sourceNode = audioContext.createMediaElementSource(audioElement);
  
  // Create an analyzer for visualization
  const analyzerNode = audioContext.createAnalyser();
  analyzerNode.fftSize = 256;
  
  // Connect the source to the analyzer
  sourceNode.connect(analyzerNode);
  
  // Connect the analyzer to the destination (speakers)
  analyzerNode.connect(audioContext.destination);
  
  return { sourceNode, analyzerNode };
}

/**
 * Disconnect and clean up audio nodes
 */
export function disconnectAudioNodes(
  sourceNode: MediaElementAudioSourceNode | null,
  analyzerNode: AnalyserNode | null
): void {
  if (sourceNode) {
    try {
      sourceNode.disconnect();
    } catch (error) {
      console.error("Error disconnecting source node:", error);
    }
  }
  
  if (analyzerNode) {
    try {
      analyzerNode.disconnect();
    } catch (error) {
      console.error("Error disconnecting analyzer node:", error);
    }
  }
}

/**
 * Get sound frequencies for visualization
 */
export function getFrequencyData(analyzerNode: AnalyserNode): Uint8Array {
  const bufferLength = analyzerNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyzerNode.getByteFrequencyData(dataArray);
  return dataArray;
}

/**
 * Applies crossfade effect between two audio elements
 */
export function crossfadeAudio(
  currentAudio: HTMLAudioElement,
  nextAudio: HTMLAudioElement,
  fadeDuration: number = 2000
): Promise<void> {
  return new Promise((resolve) => {
    if (!currentAudio || !nextAudio) {
      resolve();
      return;
    }
    
    // Start the next audio at volume 0
    nextAudio.volume = 0;
    const playPromise = nextAudio.play();
    
    if (playPromise === undefined) {
      resolve();
      return;
    }
    
    playPromise
      .then(() => {
        const fadeInterval = 50; // ms
        const fadeSteps = fadeDuration / fadeInterval;
        const volumeStep = 1 / fadeSteps;
        
        let currentStep = 0;
        
        const fade = () => {
          currentStep++;
          
          // Fade out current audio
          currentAudio.volume = Math.max(0, 1 - (currentStep * volumeStep));
          
          // Fade in next audio
          nextAudio.volume = Math.min(1, currentStep * volumeStep);
          
          if (currentStep >= fadeSteps) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            clearInterval(intervalId);
            resolve();
          }
        };
        
        const intervalId = setInterval(fade, fadeInterval);
      })
      .catch((error) => {
        console.error("Error starting crossfade:", error);
        resolve();
      });
  });
}

/**
 * Check if file is audio and get its type
 */
export function isAudioFile(file: File): boolean {
  const audioTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/mp4',
    'audio/flac'
  ];
  
  return audioTypes.includes(file.type);
}

/**
 * Gets the optimal audio format based on browser support
 */
export function getOptimalAudioFormat(): string {
  const audio = document.createElement('audio');
  
  if (audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, '')) {
    return 'ogg';
  } else if (audio.canPlayType('audio/mp4; codecs="mp4a.40.5"').replace(/no/, '')) {
    return 'aac';
  } else {
    return 'mp3'; // Default fallback
  }
}
