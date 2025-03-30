
import { useState, useEffect } from "react";
import { Soundscape } from "@/lib/types";
import { soundscapes as sampleSoundscapes } from "@/data/soundscapes";
import { supabase } from "@/integrations/supabase/client";
import { generateId } from "../utils";
import { toast } from "sonner";
import { processSoundscapeUrls } from "@/utils/meditation-utils";

export function useSoundscapeState() {
  const [soundscapesData, setSoundscapes] = useState<Soundscape[]>([]);
  const [currentSoundscape, setCurrentSoundscape] = useState<Soundscape | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load soundscapes from Supabase
  useEffect(() => {
    const fetchSoundscapes = async () => {
      try {
        setIsLoading(true);
        
        // Try to fetch from Supabase first
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
          const transformedSoundscapes: Soundscape[] = dbSoundscapes.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            audioUrl: item.audio_url,
            coverImageUrl: item.cover_image_url,
            category: item.category,
            tags: item.tags || []
          }));
          
          // Process URLs to ensure they are valid
          const processedSoundscapes = await processSoundscapeUrls(transformedSoundscapes);
          setSoundscapes(processedSoundscapes);
        } else {
          console.log("No soundscapes found in database, using sample data");
          
          // Use sample data as fallback
          const processedSoundscapes = await processSoundscapeUrls(sampleSoundscapes);
          setSoundscapes(processedSoundscapes);
          
          // Optionally, could also initialize the database with sample data here
        }
      } catch (error) {
        console.error("Error fetching soundscapes:", error);
        toast.error("Fout bij het laden van soundscapes");
        
        // Fallback to sample data on error
        const processedSoundscapes = await processSoundscapeUrls(sampleSoundscapes);
        setSoundscapes(processedSoundscapes);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSoundscapes();
  }, []);
  
  // CRUD functions for soundscapes
  async function addSoundscape(soundscape: Omit<Soundscape, 'id'>) {
    try {
      // Insert into Supabase
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
        const newSoundscape: Soundscape = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          audioUrl: data.audio_url,
          coverImageUrl: data.cover_image_url,
          category: data.category,
          tags: data.tags || []
        };
        
        // Process URLs
        const processedSoundscape = await processSoundscapeUrls([newSoundscape]);
        
        // Update local state
        setSoundscapes(prev => [...prev, processedSoundscape[0]]);
        toast.success("Soundscape toegevoegd");
      }
    } catch (error) {
      console.error("Error adding soundscape:", error);
      toast.error("Fout bij het toevoegen van soundscape");
      
      // Fallback to local-only if Supabase insert fails
      const newSoundscape: Soundscape = {
        ...soundscape,
        id: generateId(),
      };
      setSoundscapes(prev => [...prev, newSoundscape]);
    }
  }
  
  async function updateSoundscape(id: string, soundscape: Partial<Soundscape>) {
    try {
      // Update in Supabase
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
      
      // Update local state
      setSoundscapes(prev => 
        prev.map(s => {
          if (s.id === id) {
            const updated = { ...s, ...soundscape };
            return updated;
          }
          return s;
        })
      );
      
      toast.success("Soundscape bijgewerkt");
    } catch (error) {
      console.error("Error updating soundscape:", error);
      toast.error("Fout bij het bijwerken van soundscape");
      
      // Still update local state even if Supabase update fails
      setSoundscapes(prev => 
        prev.map(s => (s.id === id ? { ...s, ...soundscape } : s))
      );
    }
  }
  
  async function deleteSoundscape(id: string) {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('soundscapes')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setSoundscapes(prev => prev.filter(s => s.id !== id));
      toast.success("Soundscape verwijderd");
    } catch (error) {
      console.error("Error deleting soundscape:", error);
      toast.error("Fout bij het verwijderen van soundscape");
      
      // Still update local state even if Supabase delete fails
      setSoundscapes(prev => prev.filter(s => s.id !== id));
    }
  }
  
  function setSoundscapes(newSoundscapes: Soundscape[]) {
    setSoundscapes(newSoundscapes);
  }
  
  return {
    soundscapes: soundscapesData,
    currentSoundscape,
    setCurrentSoundscape,
    addSoundscape,
    updateSoundscape,
    deleteSoundscape,
    setSoundscapes,
    isLoading
  };
}
