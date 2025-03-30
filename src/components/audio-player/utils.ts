// Format time in MM:SS format
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Get MIME type based on audio file extension
export const getAudioMimeType = (url?: string): string => {
  if (!url) return 'audio/mpeg';
  
  const extension = url.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'ogg':
      return 'audio/ogg';
    case 'aac':
    case 'm4a':
      return 'audio/aac';
    default:
      return 'audio/mpeg';
  }
};

// Remove a specific radio stream from local storage
export const removeFromRecentStreams = (streamId: string): void => {
  try {
    const recentStreams = localStorage.getItem('recentStreams');
    if (recentStreams) {
      const streams = JSON.parse(recentStreams);
      const updatedStreams = streams.filter((id: string) => id !== streamId);
      localStorage.setItem('recentStreams', JSON.stringify(updatedStreams));
    }
  } catch (error) {
    console.error('Error removing from recent streams:', error);
  }
};

// Add a radio stream to local storage
export const addToRecentStreams = (streamId: string): void => {
  try {
    const recentStreams = localStorage.getItem('recentStreams');
    let streams = recentStreams ? JSON.parse(recentStreams) : [];
    
    // Remove if already exists
    streams = streams.filter((id: string) => id !== streamId);
    
    // Add to beginning
    streams.unshift(streamId);
    
    // Limit to 5 recent streams
    if (streams.length > 5) {
      streams = streams.slice(0, 5);
    }
    
    localStorage.setItem('recentStreams', JSON.stringify(streams));
  } catch (error) {
    console.error('Error adding to recent streams:', error);
  }
};

// Fix any issues with audio URLs before playback
export const validateAudioUrl = (url?: string): string => {
  if (!url) return '';
  
  // If URL doesn't have a protocol, assume https
  if (url && !url.startsWith('http') && !url.startsWith('/')) {
    return `https://${url}`;
  }
  
  return url;
};

// Fix issue with Supabase storage URLs
export const fixSupabaseStorageUrl = (url: string): string => {
  if (!url) return '';
  
  // Check if it's already a full URL
  if (url.startsWith('http')) {
    return url;
  }
  
  // Check if it's a relative URL
  if (url.startsWith('/')) {
    return url;
  }
  
  // Otherwise, assume it's a Supabase storage path
  return `https://storage.googleapis.com/${url}`;
};

// Complete URL validation
export const completeUrlValidation = (url: string): string => {
  let validatedUrl = validateAudioUrl(url);
  
  // If it looks like a Supabase storage URL
  if (validatedUrl.includes('storage.googleapis.com') || validatedUrl.includes('supabase')) {
    validatedUrl = fixSupabaseStorageUrl(validatedUrl);
  }
  
  return validatedUrl;
};
