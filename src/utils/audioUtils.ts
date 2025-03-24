
/**
 * Calculates the audio duration in seconds
 */
export const calculateAudioDuration = (audio: HTMLAudioElement): Promise<number> => {
  return new Promise((resolve) => {
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
    }, { once: true });
    
    // If audio already has metadata loaded
    if (audio.readyState >= 2) {
      resolve(audio.duration);
    }
  });
};

/**
 * Generates waveform data from an audio file
 * @param audioUrl - URL of the audio file
 * @param samplesCount - Number of data points to generate
 */
export const generateWaveformData = async (
  audioUrl: string, 
  samplesCount = 100
): Promise<number[]> => {
  try {
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const channelData = audioBuffer.getChannelData(0); // Get the first channel
    const blockSize = Math.floor(channelData.length / samplesCount);
    const waveformData = [];
    
    for (let i = 0; i < samplesCount; i++) {
      const start = i * blockSize;
      let sum = 0;
      
      // Calculate the average amplitude of this block
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(channelData[start + j] || 0);
      }
      
      const average = sum / blockSize;
      waveformData.push(average);
    }
    
    // Normalize values to be between 0 and 1
    const max = Math.max(...waveformData);
    return waveformData.map(val => val / max);
  } catch (error) {
    console.error("Error generating waveform data:", error);
    return Array(samplesCount).fill(0.1); // Return flat line if error
  }
};

/**
 * Format seconds into mm:ss format
 */
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return "00:00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
