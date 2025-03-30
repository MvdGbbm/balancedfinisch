
// Calculate the color for the slider thumb based on the gain value
export const getSliderThumbColor = (value: number, max: number): string => {
  // Start with blue at 0 and gradually transition to green at max
  const blueComponent = Math.max(0, 255 * (1 - value / max)).toFixed(0);
  const greenComponent = Math.min(255, 100 + (155 * value / max)).toFixed(0);
  return `rgb(0, ${greenComponent}, ${blueComponent})`;
};

export const generateImpulseResponse = (
  audioContext: AudioContext,
  convolverNode: ConvolverNode
): void => {
  try {
    const sampleRate = audioContext.sampleRate;
    const length = 2 * sampleRate;
    const impulseResponse = audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulseResponse.getChannelData(channel);
      
      for (let i = 0; i < length; i++) {
        const decay = Math.exp(-i / (sampleRate * 0.5));
        channelData[i] = (Math.random() * 2 - 1) * decay;
      }
    }
    
    convolverNode.buffer = impulseResponse;
  } catch (error) {
    console.error("Error generating impulse response:", error);
  }
};
