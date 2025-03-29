
import { Meditation, Soundscape } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateAudioUrl, checkUrlExists } from "@/components/audio-player/utils";

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
    // Try to get the URL from Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    if (error) {
      console.error(`Error getting public URL for ${path}:`, error);
      return '/placeholder.svg'; // Fallback to placeholder
    }
    
    if (data?.publicUrl) {
      // Validate the URL format
      const validUrl = validateAudioUrl(data.publicUrl);
      if (!validUrl) {
        console.error(`Invalid URL format for path: ${path}`);
        return '/placeholder.svg';
      }
      
      // Cache URL for later use
      urlCache.set(cacheKey, validUrl);
      console.log(`Loaded URL from ${bucket} for path: ${path}`, validUrl);
      return validUrl;
    }
    
    console.error(`No public URL returned for path: ${path} from bucket: ${bucket}`);
    return '/placeholder.svg'; // Fallback to placeholder
  } catch (error) {
    console.error(`Error getting public URL for ${path} from ${bucket}:`, error);
    return '/placeholder.svg'; // Fallback to placeholder
  }
};

/**
 * Processes meditation URLs for audio and images with validation
 */
export const processMeditationUrls = async (meditations: Meditation[]): Promise<Meditation[]> => {
  try {
    console.log("Processing meditation URLs for", meditations.length, "meditations");
    
    const processed = await Promise.all(
      meditations.map(async (meditation) => {
        try {
          let audioUrl = meditation.audioUrl || '';
          let coverImageUrl = meditation.coverImageUrl || '/placeholder.svg';
          let veraLink = meditation.veraLink || '';
          let marcoLink = meditation.marcoLink || '';
          
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
            const validatedUrl = validateAudioUrl(audioUrl);
            if (validatedUrl !== audioUrl) {
              console.log(`Fixed audio URL for ${meditation.title}: ${audioUrl} -> ${validatedUrl}`);
              audioUrl = validatedUrl;
            }
          }
          
          // Process Vera and Marco links
          if (veraLink) {
            veraLink = validateAudioUrl(veraLink) || '';
          }
          
          if (marcoLink) {
            marcoLink = validateAudioUrl(marcoLink) || '';
          }
          
          // Process image URL
          if (coverImageUrl && !coverImageUrl.startsWith('http') && !coverImageUrl.startsWith('/')) {
            coverImageUrl = await getPublicUrl(coverImageUrl, 'meditations');
          }
          
          return {
            ...meditation,
            audioUrl,
            coverImageUrl,
            veraLink,
            marcoLink
          };
        } catch (err) {
          console.error(`Error processing meditation ${meditation.id}:`, err);
          // Return the meditation with unprocessed URLs if there's an error
          return meditation;
        }
      })
    );
    
    console.log("Processed meditations:", processed);
    
    // Filter out meditations with completely invalid URLs
    const validMeditations = processed.filter(med => {
      const hasValidAudio = !!med.audioUrl || !!med.veraLink || !!med.marcoLink;
      if (!hasValidAudio) {
        console.warn(`Meditation ${med.title} has no valid audio URLs`);
      }
      return true; // Keep all meditations but log warnings
    });
    
    return validMeditations;
  } catch (error) {
    console.error("Error in processMeditationUrls:", error);
    toast.error("Er is een fout opgetreden bij het laden van meditaties");
    return meditations; // Return original meditations in case of error
  }
};

/**
 * Processes soundscape URLs for audio and images with validation
 */
export const processSoundscapeUrls = async (soundscapes: Soundscape[]): Promise<Soundscape[]> => {
  try {
    console.log("Processing soundscape URLs...");
    
    const processed = await Promise.all(
      soundscapes.map(async (soundscape) => {
        try {
          let audioUrl = soundscape.audioUrl;
          let coverImageUrl = soundscape.coverImageUrl;
          
          // Process audio URL
          if (audioUrl && !audioUrl.startsWith('http')) {
            audioUrl = await getPublicUrl(audioUrl, 'soundscapes');
            
            // Validate URL
            if (audioUrl) {
              audioUrl = validateAudioUrl(audioUrl);
            }
          }
          
          // Process image URL
          if (coverImageUrl && !coverImageUrl.startsWith('http')) {
            coverImageUrl = await getPublicUrl(coverImageUrl, 'soundscapes');
          }
          
          return {
            ...soundscape,
            audioUrl,
            coverImageUrl
          };
        } catch (err) {
          console.error(`Error processing soundscape ${soundscape.id}:`, err);
          return soundscape; // Return original in case of error
        }
      })
    );
    
    console.log("Processed soundscapes:", processed);
    return processed;
  } catch (error) {
    console.error("Error in processSoundscapeUrls:", error);
    toast.error("Er is een fout opgetreden bij het laden van soundscapes");
    return soundscapes; // Return original soundscapes in case of error
  }
};

/**
 * Filters meditations based on search term and category
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

/**
 * Preloads meditation audio to check if it's available
 */
export const preloadMeditationAudio = async (meditation: Meditation): Promise<boolean> => {
  if (!meditation) return false;
  
  // Check primary audio URL
  if (meditation.audioUrl) {
    const isValid = await checkUrlExists(meditation.audioUrl);
    if (isValid) return true;
  }
  
  // Check Vera's link as fallback
  if (meditation.veraLink) {
    const isValid = await checkUrlExists(meditation.veraLink);
    if (isValid) return true;
  }
  
  // Check Marco's link as fallback
  if (meditation.marcoLink) {
    const isValid = await checkUrlExists(meditation.marcoLink);
    if (isValid) return true;
  }
  
  return false;
};
