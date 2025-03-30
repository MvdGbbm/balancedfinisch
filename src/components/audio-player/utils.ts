export const getRandomQuote = () => {
  const quotes = [
    {
      text: "The mind is everything. What you think you become.",
      author: "Buddha"
    },
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs"
    },
    {
      text: "In the middle of difficulty lies opportunity.",
      author: "Albert Einstein"
    },
    {
      text: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt"
    },
    {
      text: "Happiness is not something readymade. It comes from your own actions.",
      author: "Dalai Lama"
    },
    {
      text: "The best time to plant a tree was 20 years ago. The second best time is now.",
      author: "Chinese Proverb"
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt"
    },
    {
      text: "Darkness cannot drive out darkness: only light can do that. Hate cannot drive out hate: only love can do that.",
      author: "Martin Luther King Jr."
    },
    {
      text: "It is never too late to be what you might have been.",
      author: "George Eliot"
    },
    {
      text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
      author: "Buddha"
    }
  ];

  return quotes[Math.floor(Math.random() * quotes.length)];
};

export const validateAudioUrl = (url: string): string => {
  if (!url) {
    console.warn("No URL provided");
    return "";
  }

  let validatedUrl = url.trim();

  if (validatedUrl.startsWith("//")) {
    validatedUrl = "https:" + validatedUrl;
  }

  if (!validatedUrl.startsWith("http://") && !validatedUrl.startsWith("https://")) {
    validatedUrl = "https://" + validatedUrl;
  }

  try {
    new URL(validatedUrl);
    return validatedUrl;
  } catch (e) {
    console.error("Invalid URL:", url, e);
    return "";
  }
};

export const getAudioMimeType = (url: string): string => {
  if (!url) {
    console.warn("No URL provided to determine MIME type.");
    return "audio/mpeg";
  }

  const lowerUrl = url.toLowerCase();

  if (lowerUrl.endsWith(".mp3")) {
    return "audio/mpeg";
  } else if (lowerUrl.endsWith(".wav")) {
    return "audio/wav";
  } else if (lowerUrl.endsWith(".ogg")) {
    return "audio/ogg";
  } else if (lowerUrl.endsWith(".aac")) {
    return "audio/aac";
  } else if (lowerUrl.endsWith(".m4a")) {
    return "audio/mp4";
  } else {
    console.warn("Unknown audio format, defaulting to MPEG.");
    return "audio/mpeg";
  }
};

// Add these functions if they don't already exist in utils.ts
export const isStreamUrl = (url: string): boolean => {
  return url.includes('stream') || 
         url.includes('live') || 
         url.includes('radio') || 
         (url.includes('http') && !url.match(/\.(mp3|wav|ogg|aac|m4a)$/i));
};

export const preloadAudio = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const audio = new Audio();
      audio.preload = 'metadata';
      
      const onCanPlayThrough = () => {
        audio.removeEventListener('canplaythrough', onCanPlayThrough);
        audio.removeEventListener('error', onError);
        resolve(true);
      };
      
      const onError = () => {
        audio.removeEventListener('canplaythrough', onCanPlayThrough);
        audio.removeEventListener('error', onError);
        resolve(false);
      };
      
      audio.addEventListener('canplaythrough', onCanPlayThrough);
      audio.addEventListener('error', onError);
      
      audio.src = url;
      audio.load();
      
      // Set a timeout in case the audio never loads or errors
      setTimeout(() => {
        audio.removeEventListener('canplaythrough', onCanPlayThrough);
        audio.removeEventListener('error', onError);
        resolve(false);
      }, 5000);
    } catch (e) {
      console.error("Error preloading audio:", e);
      resolve(false);
    }
  });
};
