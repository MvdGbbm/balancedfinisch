
/**
 * Utilities for handling audio formats and metadata
 */

/**
 * Gets MIME type based on audio URL extension
 */
export const getAudioMimeType = (url: string): string => {
  if (!url) return 'audio/mpeg';
  
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.endsWith('.mp3')) return 'audio/mpeg';
  if (lowerUrl.endsWith('.wav')) return 'audio/wav';
  if (lowerUrl.endsWith('.ogg')) return 'audio/ogg';
  if (lowerUrl.endsWith('.aac')) return 'audio/aac';
  if (lowerUrl.endsWith('.m4a')) return 'audio/mp4';
  if (lowerUrl.endsWith('.flac')) return 'audio/flac';
  
  // Default to MP3 if unknown
  return 'audio/mpeg';
};

/**
 * Checks if file is AAC format
 */
export const isAACFile = (url: string): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.endsWith('.aac') || lowerUrl.endsWith('.m4a');
};

/**
 * Formats time in seconds to MM:SS format
 */
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
