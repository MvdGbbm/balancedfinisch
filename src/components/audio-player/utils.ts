export const validateAudioUrl = (url: string): string | null => {
  try {
    new URL(url);
    if (url.startsWith('blob:')) {
      return url;
    }
    const isAllowedExtension = /\.(mp3|wav|ogg)$/i.test(url);
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

export const preloadAudio = async (url: string) => {
  return new Promise<void>((resolve, reject) => {
    const audio = new Audio();
    audio.src = url;
    audio.oncanplaythrough = () => resolve();
    audio.onerror = (err) => reject(err);
    audio.load();
  });
};
