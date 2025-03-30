
import { Soundscape } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SaveOptions {
  title: string;
  description: string;
  audioUrl: string;
  coverImageUrl: string;
  tags: string[];
  currentMusic: Soundscape | null;
}

export const saveSoundscapeToSupabase = async ({
  title,
  description,
  audioUrl,
  coverImageUrl,
  tags,
  currentMusic
}: SaveOptions): Promise<boolean> => {
  try {
    if (currentMusic) {
      // Update existing record
      const { error } = await supabase
        .from('soundscapes')
        .update({
          title: title,
          description: description,
          audio_url: audioUrl,
          cover_image_url: coverImageUrl,
          category: "Muziek", // Default category
          tags: tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentMusic.id);
        
      if (error) {
        console.error("Error updating soundscape in database:", error);
        return false;
      } else {
        console.log("Soundscape successfully updated in Supabase");
        return true;
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('soundscapes')
        .insert({
          title: title,
          description: description,
          audio_url: audioUrl,
          cover_image_url: coverImageUrl,
          category: "Muziek", // Default category
          tags: tags
        });
        
      if (error) {
        console.error("Error saving soundscape in database:", error);
        return false;
      } else {
        console.log("Soundscape successfully saved in Supabase");
        return true;
      }
    }
  } catch (error) {
    console.error("Error in saveSoundscapeToSupabase:", error);
    return false;
  }
};
