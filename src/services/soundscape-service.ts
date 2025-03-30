
import { supabase } from "@/integrations/supabase/client";
import { Soundscape } from "@/lib/types";
import { transformSoundscapeData } from "@/utils/soundscape-utils";
import { processSoundscapeUrls } from "@/utils/meditation-utils";

/**
 * Fetches all soundscapes from Supabase
 */
export const fetchSoundscapesFromDb = async (): Promise<Soundscape[] | null> => {
  try {
    const { data: dbSoundscapes, error } = await supabase
      .from('soundscapes')
      .select('*')
      .order('title');
    
    if (error) {
      throw error;
    }
    
    if (dbSoundscapes && dbSoundscapes.length > 0) {
      console.log("Loaded soundscapes from Supabase:", dbSoundscapes.length);
      
      // Transform Supabase data to our app format
      const transformedSoundscapes = transformSoundscapeData(dbSoundscapes);
      
      // Process URLs to ensure they are valid
      return await processSoundscapeUrls(transformedSoundscapes);
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching soundscapes:", error);
    throw error;
  }
};

/**
 * Adds a new soundscape to Supabase
 */
export const addSoundscapeToDb = async (soundscape: Omit<Soundscape, 'id'>): Promise<Soundscape | null> => {
  try {
    const { data, error } = await supabase
      .from('soundscapes')
      .insert({
        title: soundscape.title,
        description: soundscape.description,
        audio_url: soundscape.audioUrl,
        cover_image_url: soundscape.coverImageUrl,
        category: soundscape.category,
        tags: soundscape.tags || []
      })
      .select('*')
      .single();
    
    if (error) {
      throw error;
    }
    
    if (data) {
      // Transform to app format
      const newSoundscape = transformSoundscapeData([data])[0];
      
      // Process URLs
      const processedSoundscape = await processSoundscapeUrls([newSoundscape]);
      return processedSoundscape[0];
    }
    
    return null;
  } catch (error) {
    console.error("Error adding soundscape:", error);
    throw error;
  }
};

/**
 * Updates an existing soundscape in Supabase
 */
export const updateSoundscapeInDb = async (id: string, soundscape: Partial<Soundscape>): Promise<void> => {
  const { error } = await supabase
    .from('soundscapes')
    .update({
      title: soundscape.title,
      description: soundscape.description,
      audio_url: soundscape.audioUrl,
      cover_image_url: soundscape.coverImageUrl,
      category: soundscape.category,
      tags: soundscape.tags,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
  
  if (error) {
    throw error;
  }
};

/**
 * Deletes a soundscape from Supabase
 */
export const deleteSoundscapeFromDb = async (id: string): Promise<void> => {
  // Only attempt to delete if it's a UUID (not a sample ID like "sound-1")
  if (!id.startsWith('sound-')) {
    try {
      const { error } = await supabase
        .from('soundscapes')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting from Supabase:", error);
        throw error;
      }
      
      console.log(`Soundscape with ID ${id} successfully deleted from database`);
    } catch (error) {
      console.error("Exception when deleting soundscape:", error);
      throw error;
    }
  } else {
    console.log(`Skipping database delete for sample ID: ${id}`);
  }
};
