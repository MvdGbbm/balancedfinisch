import { Meditation, Soundscape } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateAudioUrl } from "@/components/audio-player/utils";

// Cache om redundante verwerking te voorkomen
const urlCache = new Map<string, string>();

/**
 * Haalt een publieke URL op voor een bestand in Supabase storage of gebruikt fallback
 */
export const getPublicUrl = async (path: string, bucket = 'meditations'): Promise<string> => {
  if (!path) {
    console.error('Leeg pad opgegeven aan getPublicUrl');
    return '/placeholder.svg'; // Fallback naar placeholder
  }
  
  // Als het al een volledige URL is, geef deze direct terug
  if (path.startsWith('http')) {
    return path;
  }
  
  // Als het een lokaal pad is (begint met /), gebruik het direct
  if (path.startsWith('/')) {
    return path;
  }
  
  // Detecteer en negeer placeholder URLs
  if (path.includes('example.com')) {
    console.warn("Placeholder URL gedetecteerd:", path);
    return '';
  }
  
  // Controleer eerst de cache
  const cacheKey = `${bucket}:${path}`;
  if (urlCache.has(cacheKey)) {
    return urlCache.get(cacheKey) as string;
  }
  
  try {
    // Hier is de fix: getPublicUrl() geeft geen error property terug, alleen data
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    if (data?.publicUrl) {
      // Cache URL voor later gebruik
      urlCache.set(cacheKey, data.publicUrl);
      console.log(`URL geladen van ${bucket} voor pad: ${path}`, data.publicUrl);
      return data.publicUrl;
    }
    
    console.error(`Geen publieke URL teruggegeven voor pad: ${path} van bucket: ${bucket}`);
    return '/placeholder.svg'; // Fallback naar placeholder
  } catch (error) {
    console.error(`Fout bij het ophalen van publieke URL voor ${path} van ${bucket}:`, error);
    return '/placeholder.svg'; // Fallback naar placeholder
  }
};

/**
 * Verwerkt meditatie URLs voor audio en afbeeldingen
 */
export const processMeditationUrls = async (meditations: Meditation[]): Promise<Meditation[]> => {
  try {
    console.log("Meditatie URLs verwerken voor", meditations.length, "meditaties");
    
    const processed = await Promise.all(
      meditations.map(async (meditation) => {
        try {
          let audioUrl = meditation.audioUrl || '';
          let coverImageUrl = meditation.coverImageUrl || '/placeholder.svg';
          let veraLink = meditation.veraLink || '';
          let marcoLink = meditation.marcoLink || '';
          
          // Sla placeholder URLs over
          if (audioUrl.includes('example.com')) {
            console.warn("Placeholder audio URL overgeslagen voor meditatie:", meditation.title);
            audioUrl = '';
          }
          
          // Verwerk audio URL als deze bestaat en nog niet verwerkt is
          if (audioUrl && !audioUrl.startsWith('http') && !audioUrl.startsWith('/')) {
            audioUrl = await getPublicUrl(audioUrl, 'meditations');
          }
          
          // Valideer de audio URL
          if (audioUrl) {
            audioUrl = validateAudioUrl(audioUrl);
          }
          
          // Verwerk afbeelding URL
          if (coverImageUrl && !coverImageUrl.startsWith('http') && !coverImageUrl.startsWith('/')) {
            coverImageUrl = await getPublicUrl(coverImageUrl, 'meditations');
          }
          
          // Verwerk Vera en Marco links
          if (veraLink && !veraLink.startsWith('http')) {
            veraLink = `https://${veraLink.replace(/^\/\//, '')}`;
          }
          
          if (marcoLink && !marcoLink.startsWith('http')) {
            marcoLink = `https://${marcoLink.replace(/^\/\//, '')}`;
          }
          
          return {
            ...meditation,
            audioUrl,
            coverImageUrl,
            veraLink,
            marcoLink
          };
        } catch (err) {
          console.error(`Fout bij het verwerken van meditatie ${meditation.id}:`, err);
          // Retourneer de meditatie met onverwerkte URLs bij een fout
          return meditation;
        }
      })
    );
    
    console.log("Verwerkte meditaties:", processed);
    return processed;
  } catch (error) {
    console.error("Fout in processMeditationUrls:", error);
    toast.error("Er is een fout opgetreden bij het laden van meditaties");
    return meditations; // Retourneer originele meditaties in geval van fout
  }
};

/**
 * Verwerkt soundscape URL's voor audio en afbeeldingen
 */
export const processSoundscapeUrls = async (soundscapes: Soundscape[]): Promise<Soundscape[]> => {
  try {
    console.log("Soundscape URLs verwerken...");
    
    const processed = await Promise.all(
      soundscapes.map(async (soundscape) => {
        try {
          let audioUrl = soundscape.audioUrl || '';
          let coverImageUrl = soundscape.coverImageUrl || '';
          
          // Sla placeholder URLs over
          if (audioUrl.includes('example.com')) {
            console.warn("Placeholder audio URL overgeslagen voor soundscape:", soundscape.title);
            audioUrl = '';
          }
          
          // Verwerk audio URL
          if (audioUrl && !audioUrl.startsWith('http')) {
            audioUrl = await getPublicUrl(audioUrl, 'soundscapes');
            // Valideer de audio URL
            if (audioUrl) {
              audioUrl = validateAudioUrl(audioUrl);
            }
          }
          
          // Verwerk afbeelding URL
          if (coverImageUrl && !coverImageUrl.startsWith('http')) {
            coverImageUrl = await getPublicUrl(coverImageUrl, 'soundscapes');
          }
          
          return {
            ...soundscape,
            audioUrl,
            coverImageUrl
          };
        } catch (err) {
          console.error(`Fout bij het verwerken van soundscape ${soundscape.id}:`, err);
          return soundscape;
        }
      })
    );
    
    console.log("Verwerkte soundscapes:", processed);
    return processed;
  } catch (error) {
    console.error("Fout in processSoundscapeUrls:", error);
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

/**
 * Bereidt een meditatie voor op het opslaan
 */
export const prepareMeditationForSave = (meditation: Omit<Meditation, "id">): Omit<Meditation, "id"> => {
  // Zorg ervoor dat alle URL's correct zijn
  let processedMeditation = { ...meditation };
  
  // Voeg http toe aan URLs die dat nog niet hebben
  if (processedMeditation.audioUrl && !processedMeditation.audioUrl.startsWith('http')) {
    processedMeditation.audioUrl = `https://${processedMeditation.audioUrl.replace(/^\/\//, '')}`;
  }
  
  if (processedMeditation.coverImageUrl && !processedMeditation.coverImageUrl.startsWith('http')) {
    processedMeditation.coverImageUrl = `https://${processedMeditation.coverImageUrl.replace(/^\/\//, '')}`;
  }
  
  if (processedMeditation.veraLink && !processedMeditation.veraLink.startsWith('http')) {
    processedMeditation.veraLink = `https://${processedMeditation.veraLink.replace(/^\/\//, '')}`;
  }
  
  if (processedMeditation.marcoLink && !processedMeditation.marcoLink.startsWith('http')) {
    processedMeditation.marcoLink = `https://${processedMeditation.marcoLink.replace(/^\/\//, '')}`;
  }
  
  return processedMeditation;
};
