
// Utility functions for breathing exercises

// Load voice URLs from configuration or API
export const loadVoiceUrls = () => {
  // Return an array of available voice URLs
  return [
    { id: 'voice-1', name: 'Female Voice', url: '/audio/breathing/voice-female.mp3' },
    { id: 'voice-2', name: 'Male Voice', url: '/audio/breathing/voice-male.mp3' },
    { id: 'voice-3', name: 'Calm Voice', url: '/audio/breathing/voice-calm.mp3' }
  ];
};

// Handle voice activation
export const handleActivateVoice = (
  voiceId: string,
  setActiveVoice: (id: string) => void,
  setVoiceUrl: (url: string) => void
) => {
  const voices = loadVoiceUrls();
  const selectedVoice = voices.find(voice => voice.id === voiceId);
  
  if (selectedVoice) {
    setActiveVoice(voiceId);
    setVoiceUrl(selectedVoice.url);
    return true;
  }
  
  return false;
};

// Convert seconds to mm:ss format
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Calculate breathing pattern timing
export const calculateBreathingTiming = (
  inhaleTime: number,
  holdTime: number,
  exhaleTime: number,
  afterExhaleHoldTime: number
) => {
  const totalCycleTime = inhaleTime + holdTime + exhaleTime + afterExhaleHoldTime;
  
  return {
    inhalePercentage: (inhaleTime / totalCycleTime) * 100,
    holdPercentage: (holdTime / totalCycleTime) * 100,
    exhalePercentage: (exhaleTime / totalCycleTime) * 100,
    afterExhaleHoldPercentage: (afterExhaleHoldTime / totalCycleTime) * 100,
    totalCycleTime
  };
};
