import { Meditation, Soundscape } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateAudioUrl } from "@/components/audio-player/utils";

// Cache to avoid redundant processing
const urlCache = new Map<string, string>();

/**
 * Gets a public URL for a file in Supabase storage or uses fallback
 */
export const getPublicUrl = async (path: string, bucket = 'meditations'): Promise<string> => {
  if (!path) {
    console.error('Empty path provided to getPublicUrl');
    return '/placeholder.svg'; // Fallback to placeholder
  }
  
  // If already a full URL, return it directly
  if (path.startsWith('http')) {
    return path;
  }
  
  // If it's a local path (starts with /), use it directly
  if (path.startsWith('/')) {
    return path;
  }
  
  // Detect and ignore placeholder URLs
  if (path.includes('example.com')) {
    console.warn("Placeholder URL detected:", path);
    return '';
  }
  
  // Check cache first
  const cacheKey = `${bucket}:${path}`;
  if (urlCache.has(cacheKey)) {
    return urlCache.get(cacheKey) as string;
  }
  
  try {
    const { data } = await supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    if (data?.publicUrl) {
      // Cache URL for later use
      urlCache.set(cacheKey, data.publicUrl);
      console.log(`Loaded URL from ${bucket} for path: ${path}`, data.publicUrl);
      return data.publicUrl;
    }
    
    console.error(`No public URL returned for path: ${path} from bucket: ${bucket}`);
    return '/placeholder.svg'; // Fallback to placeholder
  } catch (error) {
    console.error(`Error getting public URL for ${path} from ${bucket}:`, error);
    return '/placeholder.svg'; // Fallback to placeholder
  }
};

/**
 * Processes meditation URLs for audio and images
 */
export const processMeditationUrls = async (meditations: Meditation[]): Promise<Meditation[]> => {
  try {
    console.log("Processing meditation URLs for", meditations.length, "meditations");
    
    const processed = await Promise.all(
      meditations.map(async (meditation) => {
        try {
          let audioUrl = meditation.audioUrl || '';
          let coverImageUrl = meditation.coverImageUrl || '/placeholder.svg';
          
          // Skip placeholder URLs
          if (audioUrl.includes('example.com')) {
            console.warn("Skipping placeholder audio URL for meditation:", meditation.title);
            audioUrl = '';
          }
          
          // Process audio URL if it exists and isn't already processed
          if (audioUrl && !audioUrl.startsWith('http') && !audioUrl.startsWith('/')) {
            audioUrl = await getPublicUrl(audioUrl);
          }
          
          // Validate the audio URL
          if (audioUrl) {
            audioUrl = validateAudioUrl(audioUrl);
          }
          
          // Process image URL
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
          // Return the meditation with unprocessed URLs if there's an error
          return meditation;
        }
      })
    );
    
    console.log("Processed meditations:", processed);
    return processed;
  } catch (error) {
    console.error("Error in processMeditationUrls:", error);
    toast.error("Er is een fout opgetreden bij het laden van meditaties");
    return meditations; // Return original meditations in case of error
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
