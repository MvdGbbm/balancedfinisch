
import { Soundscape } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SaveOptions {
  title: string;
  description: string;
  audioUrl: string;
  coverImageUrl: string;
  tags: string[];
  category: string; // Add category field
  currentMusic: Soundscape | null;
  isFavorite?: boolean; // Add favorite flag
}

export const saveSoundscapeToSupabase = async ({
  title,
  description,
  audioUrl,
  coverImageUrl,
  tags,
  category,
  currentMusic,
  isFavorite = false
}: SaveOptions): Promise<{ success: boolean; data?: any }> => {
  try {
    if (currentMusic) {
      // Update existing record
      const { data, error } = await supabase
        .from('soundscapes')
        .update({
          title: title,
          description: description,
          audio_url: audioUrl,
          cover_image_url: coverImageUrl,
          category: category, // Use the provided category
          tags: tags,
          is_favorite: isFavorite,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentMusic.id)
        .select();
        
      if (error) {
        console.error("Error updating soundscape in database:", error);
        return { success: false };
      } else {
        console.log("Soundscape successfully updated in Supabase");
        return { success: true, data: data?.[0] };
      }
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('soundscapes')
        .insert({
          title: title,
          description: description,
          audio_url: audioUrl,
          cover_image_url: coverImageUrl,
          category: category, // Use the provided category
          tags: tags,
          is_favorite: isFavorite
        })
        .select();
        
      if (error) {
        console.error("Error saving soundscape in database:", error);
        return { success: false };
      } else {
        console.log("Soundscape successfully saved in Supabase:", data);
        return { success: true, data: data?.[0] };
      }
    }
  } catch (error) {
    console.error("Error in saveSoundscapeToSupabase:", error);
    return { success: false };
  }
};
