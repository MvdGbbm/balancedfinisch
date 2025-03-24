
import { Meditation } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const processMeditationUrls = async (meditations: Meditation[]): Promise<Meditation[]> => {
  try {
    console.log("Processing meditation URLs...");
    
    const processed = await Promise.all(
      meditations.map(async (meditation) => {
        let audioUrl = meditation.audioUrl;
        let coverImageUrl = meditation.coverImageUrl;
        
        if (!audioUrl.startsWith('http')) {
          try {
            const { data: audioData } = await supabase.storage
              .from('meditations')
              .getPublicUrl(audioUrl);
            audioUrl = audioData.publicUrl;
            console.log(`Loaded audio URL for ${meditation.title}:`, audioUrl);
          } catch (error) {
            console.error(`Error processing audio URL for ${meditation.title}:`, error);
            toast.error(`Kon audio niet laden voor ${meditation.title}`);
          }
        }
        
        if (!coverImageUrl.startsWith('http')) {
          try {
            const { data: imageData } = await supabase.storage
              .from('meditations')
              .getPublicUrl(coverImageUrl);
            coverImageUrl = imageData.publicUrl;
            console.log(`Loaded image URL for ${meditation.title}:`, coverImageUrl);
          } catch (error) {
            console.error(`Error processing cover image URL for ${meditation.title}:`, error);
            toast.error(`Kon afbeelding niet laden voor ${meditation.title}`);
          }
        }
        
        return {
          ...meditation,
          audioUrl,
          coverImageUrl
        };
      })
    );
    
    console.log("Processed meditations:", processed);
    return processed;
  } catch (error) {
    console.error("Error in processMeditationUrls:", error);
    toast.error("Er is een fout opgetreden bij het laden van meditaties");
    return [];
  }
};

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
