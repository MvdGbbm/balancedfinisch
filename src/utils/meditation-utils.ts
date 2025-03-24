
import { Meditation, Soundscape } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Cache voor URL's die al zijn verwerkt om dubbel werk te voorkomen
const urlCache = new Map<string, string>();

/**
 * Haalt een publieke URL op voor een bestand in Supabase storage of gebruikt de fallback
 */
export const getPublicUrl = async (path: string, bucket = 'meditations'): Promise<string> => {
  if (!path) {
    console.error('Empty path provided to getPublicUrl');
    return '/placeholder.svg'; // Fallback naar placeholder
  }
  
  // Als al een volledige URL is, retourneer die direct
  if (path.startsWith('http')) {
    return path;
  }
  
  // Als het een lokaal pad is (begint met /), gebruik het direct
  if (path.startsWith('/')) {
    return path;
  }
  
  // Check cache eerst
  const cacheKey = `${bucket}:${path}`;
  if (urlCache.has(cacheKey)) {
    return urlCache.get(cacheKey) as string;
  }
  
  try {
    const { data } = await supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    if (data?.publicUrl) {
      // Sla op in cache voor later gebruik
      urlCache.set(cacheKey, data.publicUrl);
      console.log(`Loaded URL from ${bucket} for path: ${path}`, data.publicUrl);
      return data.publicUrl;
    }
    
    console.error(`No public URL returned for path: ${path} from bucket: ${bucket}`);
    return '/placeholder.svg'; // Fallback naar placeholder
  } catch (error) {
    console.error(`Error getting public URL for ${path} from ${bucket}:`, error);
    return '/placeholder.svg'; // Fallback naar placeholder
  }
};

/**
 * Test of een audio URL geldig is en ondersteund
 */
export const checkAudioCompatibility = async (url: string): Promise<boolean> => {
  if (!url) return false;
  
  try {
    // Valide URL formaat?
    new URL(url);
    
    // Voor lokale bestanden, accepteer alle
    if (url.startsWith('/')) {
      return true;
    }
    
    // Voor meditatie bestanden, altijd als compatibel beschouwen
    if (url.includes('meditation') || url.includes('meditatie')) {
      return true;
    }
    
    // Bekende audio formaten
    const supportedFormats = ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.flac', '.webm'];
    const lowerUrl = url.toLowerCase();
    
    // Check of URL eindigt met ondersteund formaat
    if (supportedFormats.some(format => lowerUrl.endsWith(format))) {
      return true;
    }
    
    // Check voor bekende streamingdiensten
    if (lowerUrl.includes('stream') || 
        lowerUrl.includes('radio') || 
        lowerUrl.includes('live') || 
        lowerUrl.endsWith('.m3u8') || 
        lowerUrl.includes('icecast')) {
      return true;  
    }
    
    // Voor onbekende formaten, probeer een HEAD request
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('audio')) {
        return true;
      }
    } catch (error) {
      console.warn("Could not check Content-Type for URL:", url);
      // We vallen terug op een "best guess" aanpak als de HEAD request faalt
    }
    
    // Als we hier komen, laten we toch true retourneren en de browser het laten proberen
    return true;
  } catch (error) {
    console.error("Invalid URL format:", url);
    return false;
  }
};

/**
 * Verwerkt meditatie URL's voor audio en afbeeldingen
 */
export const processMeditationUrls = async (meditations: Meditation[]): Promise<Meditation[]> => {
  try {
    console.log("Processing meditation URLs for", meditations.length, "meditations");
    
    const processed = await Promise.all(
      meditations.map(async (meditation) => {
        try {
          let audioUrl = meditation.audioUrl || '';
          let coverImageUrl = meditation.coverImageUrl || '/placeholder.svg';
          
          // Verwerk audio URL als die bestaat
          if (audioUrl && !audioUrl.startsWith('http') && !audioUrl.startsWith('/')) {
            audioUrl = await getPublicUrl(audioUrl);
          }
          
          // Verwerk afbeelding URL
          if (coverImageUrl && !coverImageUrl.startsWith('http') && !coverImageUrl.startsWith('/')) {
            coverImageUrl = await getPublicUrl(coverImageUrl, 'meditations');
          }
          
          return {
            ...meditation,
            audioUrl,
            coverImageUrl
          };
        } catch (err) {
          console.error(`Error processing meditation ${meditation.id}:`, err);
          // Return the meditation with unprocessed URLs als er een fout is
          return meditation;
        }
      })
    );
    
    console.log("Processed meditations:", processed);
    return processed;
  } catch (error) {
    console.error("Error in processMeditationUrls:", error);
    toast.error("Er is een fout opgetreden bij het laden van meditaties");
    return meditations; // Retourneer originele meditaties in geval van fout
  }
};

/**
 * Verwerkt soundscape URL's voor audio en afbeeldingen
 */
export const processSoundscapeUrls = async (soundscapes: Soundscape[]): Promise<Soundscape[]> => {
  try {
    console.log("Processing soundscape URLs...");
    
    const processed = await Promise.all(
      soundscapes.map(async (soundscape) => {
        let audioUrl = soundscape.audioUrl;
        let coverImageUrl = soundscape.coverImageUrl;
        
        // Verwerk audio URL
        if (audioUrl && !audioUrl.startsWith('http')) {
          audioUrl = await getPublicUrl(audioUrl);
        }
        
        // Verwerk afbeelding URL
        if (coverImageUrl && !coverImageUrl.startsWith('http')) {
          coverImageUrl = await getPublicUrl(coverImageUrl);
        }
        
        return {
          ...soundscape,
          audioUrl,
          coverImageUrl
        };
      })
    );
    
    console.log("Processed soundscapes:", processed);
    return processed;
  } catch (error) {
    console.error("Error in processSoundscapeUrls:", error);
    toast.error("Er is een fout opgetreden bij het laden van soundscapes");
    return soundscapes; // Retourneer originele soundscapes in geval van fout
  }
};

/**
 * Filtert meditaties op basis van zoekterm en categorie
 */
export const filterMeditations = (meditations: Meditation[], searchQuery: string, selectedCategory: string | null): Meditation[] => {
  return meditations.filter((meditation) => {
    const matchesSearch = meditation.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) || 
      meditation.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
        
    const matchesCategory = selectedCategory 
      ? meditation.category === selectedCategory 
      : true;
      
    return matchesSearch && matchesCategory;
  });
};
