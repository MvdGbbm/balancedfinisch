
export const validateAudioUrl = (url: string): string | null => {
  try {
    new URL(url);
    if (url.startsWith('blob:')) {
      return url;
    }
    const isAllowedExtension = /\.(mp3|wav|ogg|aac|m4a)$/i.test(url);
    return isAllowedExtension ? url : null;
  } catch (e) {
    return null;
  }
};

export const checkUrlExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error("Error checking URL:", url, error);
    return false;
  }
};

export const preloadAudio = async (url: string): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    
    const audio = new Audio();
    audio.src = url;
    
    audio.oncanplaythrough = () => {
      resolve(true);
    };
    
    audio.onerror = () => {
      resolve(false);
    };
    
    // Set timeout to prevent hanging
    const timeout = setTimeout(() => {
      resolve(false);
    }, 5000);
    
    // Clean up timeout when resolved
    audio.oncanplaythrough = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    
    audio.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    
    audio.load();
  });
};

// Format time in mm:ss format
export const formatTime = (time: number): string => {
  if (isNaN(time) || !isFinite(time)) return "00:00";
  
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Check if URL is for AAC audio file
export const isAACFile = (url: string): boolean => {
  return /\.(aac|m4a)$/i.test(url) || url.includes('audio/aac') || url.includes('audio/mp4');
};

// Get MIME type based on file extension
export const getAudioMimeType = (url: string): string => {
  if (!url) return '';
  
  const extension = url.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'ogg':
      return 'audio/ogg';
    case 'aac':
      return 'audio/aac';
    case 'm4a':
      return 'audio/mp4';
    default:
      return 'audio/mpeg'; // Default to MP3
  }
};

// Check if URL is for a live stream
export const isStreamUrl = (url: string): boolean => {
  return url.includes('.m3u8') || 
         url.includes('stream') || 
         url.includes('live') || 
         url.includes('radio') ||
         url.endsWith('.pls') ||
         url.endsWith('.xspf');
};

// Fix Supabase storage URLs (sometimes they have incorrect formats)
export const fixSupabaseStorageUrl = (url: string): string => {
  if (!url) return '';
  
  // If it's already a valid URL, return it
  try {
    new URL(url);
    
    // Fix common issues with Supabase URLs
    if (url.includes('supabase.co') || url.includes('supabase.in')) {
      // Remove any double slashes except after protocol
      url = url.replace(/(https?:\/\/)|(\/\/)+/g, (match, protocol) => {
        return protocol || '/';
      });
      
      // Ensure proper storage path format
      if (!url.includes('/storage/v1/object/public/')) {
        url = url.replace(/\/storage\/v\d\/object\//, '/storage/v1/object/public/');
      }
    }
    
    return url;
  } catch (e) {
    // If it's not a valid URL, try to fix it
    if (url.startsWith('//')) {
      return 'https:' + url;
    }
    
    return url;
  }
};

// Random quotes for audio player display
const quotes = [
  {
    text: "Muziek geeft een ziel aan het universum, vleugels aan de geest, vlucht aan de verbeelding en leven aan alles.",
    author: "Plato"
  },
  {
    text: "Waar woorden falen, spreekt muziek.",
    author: "Hans Christian Andersen"
  },
  {
    text: "Zonder muziek zou het leven een vergissing zijn.",
    author: "Friedrich Nietzsche"
  },
  {
    text: "Muziek is de universele taal van de mensheid.",
    author: "Henry Wadsworth Longfellow"
  },
  {
    text: "Muziek geeft kleur aan de lucht overal.",
    author: "Irvin Berlin"
  },
  {
    text: "Muziek is de kortste weg naar het hart.",
    author: "Zoltán Kodály"
  },
  {
    text: "Als ik muziek kon vertellen, had ik geen muziek nodig.",
    author: "Claude Debussy"
  },
  {
    text: "Muziek is de stilte tussen de noten.",
    author: "Claude Debussy"
  },
  {
    text: "Na stilte, komt muziek het dichtst bij het uitdrukken van het onuitsprekelijke.",
    author: "Aldous Huxley"
  },
  {
    text: "Alles in het leven is muziek.",
    author: "Thomas Carlyle"
  }
];

export const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};
