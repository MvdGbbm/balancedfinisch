
import { Soundscape } from "@/lib/types";
import { generateId } from "@/context/utils";
import { processSoundscapeUrls } from "@/utils/meditation-utils";
import { sampleSoundscapes } from "@/data/soundscapes";

/**
 * Transforms Supabase soundscape data to app format
 */
export const transformSoundscapeData = (dbSoundscapes: any[]): Soundscape[] => {
  return dbSoundscapes.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description || '',
    audioUrl: item.audio_url,
    coverImageUrl: item.cover_image_url,
    category: item.category,
    tags: item.tags || [],
    isFavorite: item.is_favorite
  }));
};

/**
 * Creates a new soundscape with a generated ID
 */
export const createLocalSoundscape = (soundscape: Omit<Soundscape, 'id'>): Soundscape => {
  return {
    ...soundscape,
    id: generateId(),
  };
};

/**
 * Processes and returns sample soundscapes when database fetch fails
 */
export const getSampleSoundscapes = async (): Promise<Soundscape[]> => {
  return await processSoundscapeUrls(sampleSoundscapes);
};
