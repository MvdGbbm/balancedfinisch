
import { quotes, colorGradients } from "@/data/quotes";

export const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";
  
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomGradientIndex = Math.floor(Math.random() * colorGradients.length);
  return {
    ...quotes[randomIndex],
    backgroundClass: colorGradients[randomGradientIndex]
  };
};

/**
 * Valideert en corrigeert audio URLs om juiste indeling te garanderen
 */
export const validateAudioUrl = (url: string): string => {
  if (!url) return "";
  
  try {
    url = url.trim();
    
    // Controleer op placeholder URLs - deze moeten worden genegeerd
    if (url.includes('example.com')) {
      console.warn('Placeholder URL gedetecteerd:', url);
      return "";
    }
    
    // Controleer of de URL meerdere protocolprefixen heeft (bijv. https://https://)
    const protocolRegex = /^(https?:\/\/)+/i;
    const protocolMatch = url.match(protocolRegex);
    
    if (protocolMatch && protocolMatch[0] !== 'http://' && protocolMatch[0] !== 'https://') {
      // Fix dubbele/drievoudige protocollen door slechts één https:// prefix te behouden
      url = url.replace(protocolRegex, 'https://');
    }
    
    // Voeg protocol toe indien ontbrekend
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // Verwijder overbodige slashes voor bestandsextensie
    url = url.replace(/\/+(\w+\.\w+)$/, '/$1');
    
    // Fix veelvoorkomende typefouten in domeinnamen
    url = url.replace(/([^:])\/\/+/g, '$1/');

    // Speciale behandeling voor Supabase storage URLs
    if (url.includes('supabase.co/storage/v1/object/public')) {
      // Zorg ervoor dat de URL geen dubbele paden heeft voor storage
      url = url.replace(/(storage\/v1\/object\/public\/[^\/]+)\/+storage\/v1\/object\/public/, '$1');
      
      // Verwijder dubbele bucket referenties
      url = url.replace(/\/+(meditations|soundscapes)\/+(meditations|soundscapes)\/+/, '/$1/');
    }
    
    // Maak URL object om te valideren (geeft een fout als ongeldig)
    new URL(url);
    
    return url;
  } catch (error) {
    console.error("Ongeldige URL indeling:", url, error);
    // Geef lege string terug voor ongeldige URLs
    return "";
  }
};

export const isStreamUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('stream') || 
         url.includes('radio') || 
         url.includes('live') || 
         url.endsWith('.m3u8') || 
         url.includes('icecast') || 
         url.includes('shoutcast');
};

// Controleer of bestand waarschijnlijk een AAC audiobestand is
export const isAACFile = (url: string): boolean => {
  if (!url) return false;
  const lowercaseUrl = url.toLowerCase();
  return lowercaseUrl.endsWith('.aac') || 
         lowercaseUrl.endsWith('.m4a') || 
         lowercaseUrl.includes('audio/aac') || 
         lowercaseUrl.includes('audio/mp4a');
};

// Controleer of browser AAC afspelen ondersteunt
export const checkAACSupport = (): boolean => {
  const audio = document.createElement('audio');
  return audio.canPlayType('audio/aac') !== '' || 
         audio.canPlayType('audio/mp4; codecs="mp4a.40.2"') !== '';
};

// Haal geschikte MIME-type op op basis van bestandsextensie
export const getAudioMimeType = (url: string): string => {
  if (!url) return 'audio/mpeg';
  
  const lowercaseUrl = url.toLowerCase();
  
  if (lowercaseUrl.endsWith('.aac')) return 'audio/aac';
  if (lowercaseUrl.endsWith('.m4a') || lowercaseUrl.endsWith('.mp4a')) return 'audio/mp4';
  if (lowercaseUrl.endsWith('.mp3')) return 'audio/mpeg';
  if (lowercaseUrl.endsWith('.wav')) return 'audio/wav';
  if (lowercaseUrl.endsWith('.ogg')) return 'audio/ogg';
  if (lowercaseUrl.endsWith('.flac')) return 'audio/flac';
  
  // Voor Supabase storage URLs, probeer type te bepalen uit het pad
  if (lowercaseUrl.includes('supabase.co/storage')) {
    if (lowercaseUrl.includes('.mp3')) return 'audio/mpeg';
    if (lowercaseUrl.includes('.aac')) return 'audio/aac';
    if (lowercaseUrl.includes('.m4a')) return 'audio/mp4';
    if (lowercaseUrl.includes('.wav')) return 'audio/wav';
    if (lowercaseUrl.includes('.ogg')) return 'audio/ogg';
    if (lowercaseUrl.includes('.flac')) return 'audio/flac';
  }
  
  // Standaard naar algemeen audiotype
  return 'audio/mpeg';
};

// Preload en test een audio URL
export const preloadAudio = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!url) {
      console.warn("Lege URL doorgegeven aan preloadAudio");
      resolve(false);
      return;
    }
    
    // Maak URL schoon
    const validatedUrl = validateAudioUrl(url);
    if (!validatedUrl) {
      console.warn("Ongeldige URL doorgegeven aan preloadAudio:", url);
      resolve(false);
      return;
    }
    
    // Sla example.com URLs over (placeholders)
    if (validatedUrl.includes('example.com')) {
      console.warn("Placeholder URL gedetecteerd in preloadAudio:", validatedUrl);
      resolve(false);
      return;
    }
    
    console.log("Poging tot vooraf laden van audio:", validatedUrl);
    
    const audio = new Audio();
    
    // Stel een timeout in voor het laden
    const timeout = setTimeout(() => {
      console.warn("Audio vooraf laden timeout:", validatedUrl);
      audio.removeAttribute('src');
      audio.load();
      resolve(false);
    }, 8000); // 8 seconden timeout voor langzamere verbindingen
    
    // Event listeners voor succes/mislukking
    audio.oncanplaythrough = () => {
      clearTimeout(timeout);
      console.log("Audio vooraf laden succesvol:", validatedUrl);
      audio.removeAttribute('src');
      audio.load();
      resolve(true);
    };
    
    audio.onerror = (error) => {
      clearTimeout(timeout);
      console.error("Fout bij vooraf laden audio:", error, validatedUrl);
      audio.removeAttribute('src');
      audio.load();
      resolve(false);
    };
    
    // Voeg extra vangers toe voor netwerkfouten
    audio.addEventListener('stalled', () => {
      clearTimeout(timeout);
      console.warn("Audio laden vastgelopen:", validatedUrl);
      audio.removeAttribute('src');
      audio.load();
      resolve(false);
    });
    
    audio.addEventListener('abort', () => {
      clearTimeout(timeout);
      console.warn("Audio laden afgebroken:", validatedUrl);
      audio.removeAttribute('src');
      audio.load();
      resolve(false);
    });
    
    // Probeer de audio te laden
    try {
      audio.src = validatedUrl;
      audio.load();
    } catch (e) {
      clearTimeout(timeout);
      console.error("Uitzondering bij laden audio:", e);
      resolve(false);
    }
  });
};

// Controleer of een URL bestaat (kan worden geladen)
export const checkUrlExists = async (url: string): Promise<boolean> => {
  try {
    if (!url) return false;
    
    const validatedUrl = validateAudioUrl(url);
    if (!validatedUrl) return false;
    
    // Voor audiobestanden, gebruik preloadAudio
    if (/\.(mp3|ogg|wav|aac|m4a|flac)$/i.test(validatedUrl) || 
        validatedUrl.includes('supabase.co/storage')) {
      return await preloadAudio(validatedUrl);
    }
    
    // Voor andere URLs, probeer een HEAD-verzoek met CORS-proxy indien nodig
    try {
      await fetch(validatedUrl, { 
        method: 'HEAD',
        mode: 'no-cors' // Dit voorkomt CORS-fouten maar betekent ook dat we de status niet kunnen controleren
      });
      
      // Aangezien we no-cors gebruikten, kunnen we de status niet controleren
      // We nemen aan dat het gelukt is als we hier zonder fout zijn gekomen
      return true;
    } catch (e) {
      console.error("Fetch controle mislukt, preloadAudio proberen als fallback:", e);
      return await preloadAudio(validatedUrl);
    }
  } catch (error) {
    console.error("Fout bij controleren of URL bestaat:", url, error);
    return false;
  }
};

// Corrigeer Supabase storage URLs om ervoor te zorgen dat ze de juiste indeling hebben
export const fixSupabaseStorageUrl = (url: string): string => {
  if (!url || !url.includes('supabase.co')) return url;
  
  try {
    const urlObj = new URL(url);
    
    // Als de URL al een storage pad bevat, geef deze terug
    if (urlObj.pathname.includes('/storage/v1/object/public/')) {
      // Controleer op dubbele bucket paden en fix deze
      const fixedPath = urlObj.pathname.replace(/\/+(meditations|soundscapes)\/+(meditations|soundscapes)\/+/, '/$1/');
      if (fixedPath !== urlObj.pathname) {
        return `${urlObj.origin}${fixedPath}`;
      }
      return url;
    }
    
    // Identificeer de juiste bucket op basis van URL en context
    let bucket = 'meditations';
    if (url.includes('soundscape') || url.includes('music')) {
      bucket = 'soundscapes';
    }
    
    // Voeg anders het storage pad toe
    const fixedUrl = `${urlObj.origin}/storage/v1/object/public/${bucket}${urlObj.pathname}`;
    console.log("Gecorrigeerde Supabase URL:", fixedUrl);
    return fixedUrl;
  } catch (e) {
    console.error("Fout bij corrigeren Supabase URL:", e);
    return url;
  }
};

/**
 * Combineert verschillende URL fixes en validatie voor complete URL validatie
 */
export const completeUrlValidation = async (url: string, isAudio = true, bucket = 'meditations'): Promise<string> => {
  try {
    if (!url) return "";
    
    // Basisvalidatie
    let validatedUrl = validateAudioUrl(url);
    
    // Als het een Supabase URL is, herstel het speciale format
    if (validatedUrl.includes('supabase.co')) {
      validatedUrl = fixSupabaseStorageUrl(validatedUrl);
    }
    
    // Voor audio, controleer of URL geldig is
    if (isAudio) {
      const isValid = await preloadAudio(validatedUrl);
      if (!isValid) {
        console.warn("Audio URL validatie mislukt:", validatedUrl);
        // Probeer aanvullende correcties voor Supabase URLs
        if (validatedUrl.includes('supabase.co')) {
          const retryUrl = `https://lxsltsktjzgmoqwarhps.supabase.co/storage/v1/object/public/${bucket}/${url.split('/').pop()}`;
          const isRetryValid = await preloadAudio(retryUrl);
          if (isRetryValid) {
            console.log("Alternatieve URL correctie succesvol:", retryUrl);
            return retryUrl;
          }
        }
      }
    }
    
    return validatedUrl;
  } catch (error) {
    console.error("Fout in completeUrlValidation:", error);
    return "";
  }
};
