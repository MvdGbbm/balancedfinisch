
import { useState, useEffect } from "react";
import { Meditation } from "@/lib/types";
import { meditations as sampleMeditations } from "@/data/meditations";
import { supabase } from "@/integrations/supabase/client";
import { generateId } from "../utils";
import { toast } from "sonner";
import { processMeditationUrls } from "@/utils/meditation-utils";

export function useMeditationState() {
  const [meditationsData, setMeditations] = useState<Meditation[]>([]);
  const [currentMeditation, setCurrentMeditation] = useState<Meditation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load meditations from Supabase
  useEffect(() => {
    const fetchMeditations = async () => {
      try {
        setIsLoading(true);
        
        // Check if the meditations table exists in Supabase
        // For now we'll use sample data since the meditations table might not exist yet
        // Once the table is created, uncomment this code
        /*
        const { data: dbMeditations, error } = await supabase
          .from('meditations')
          .select('*')
          .order('title');
        
        if (error) {
          console.error("Error fetching from database:", error);
          // Use sample data if there's an error
          const processedMeditations = await processMeditationUrls(sampleMeditations);
          setMeditations(processedMeditations);
          return;
        }
        
        if (dbMeditations && dbMeditations.length > 0) {
          console.log("Loaded meditations from Supabase:", dbMeditations.length);
          
          // Transform Supabase data to our app format
          const transformedMeditations: Meditation[] = dbMeditations.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            audioUrl: item.audio_url,
            duration: item.duration || 10,
            category: item.category,
            coverImageUrl: item.cover_image_url,
            tags: item.tags || [],
            veraLink: item.vera_link,
            marcoLink: item.marco_link,
            createdAt: item.created_at
          }));
          
          // Process URLs to ensure they are valid
          const processedMeditations = await processMeditationUrls(transformedMeditations);
          setMeditations(processedMeditations);
        } else {
        */
          console.log("No meditations found in database, using sample data");
          
          // Use sample data as fallback
          const processedMeditations = await processMeditationUrls(sampleMeditations);
          setMeditations(processedMeditations);
        // }
      } catch (error) {
        console.error("Error fetching meditations:", error);
        toast.error("Fout bij het laden van meditaties");
        
        // Fallback to sample data on error
        const processedMeditations = await processMeditationUrls(sampleMeditations);
        setMeditations(processedMeditations);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMeditations();
  }, []);
  
  // CRUD functions for meditations
  async function addMeditation(meditation: Omit<Meditation, 'id' | 'createdAt'>) {
    try {
      const newMeditation: Meditation = {
        ...meditation,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      
      // We would insert into Supabase here if the table exists
      // For now, just update local state
      
      // Process URLs
      const processedMeditation = await processMeditationUrls([newMeditation]);
      
      // Update local state
      setMeditations(prev => [...prev, processedMeditation[0]]);
      toast.success("Meditatie toegevoegd");
    } catch (error) {
      console.error("Error adding meditation:", error);
      toast.error("Fout bij het toevoegen van meditatie");
      
      // Fallback to local-only
      const newMeditation: Meditation = {
        ...meditation,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      setMeditations(prev => [...prev, newMeditation]);
    }
  }
  
  async function updateMeditation(id: string, meditation: Partial<Meditation>) {
    try {
      // We would update in Supabase here if the table exists
      
      // Update local state
      setMeditations(prev => 
        prev.map(m => {
          if (m.id === id) {
            const updated = { ...m, ...meditation };
            return updated;
          }
          return m;
        })
      );
      
      toast.success("Meditatie bijgewerkt");
    } catch (error) {
      console.error("Error updating meditation:", error);
      toast.error("Fout bij het bijwerken van meditatie");
      
      // Still update local state
      setMeditations(prev => 
        prev.map(m => (m.id === id ? { ...m, ...meditation } : m))
      );
    }
  }
  
  async function deleteMeditation(id: string) {
    try {
      // We would delete from Supabase here if the table exists
      
      // Update local state
      setMeditations(prev => prev.filter(m => m.id !== id));
      toast.success("Meditatie verwijderd");
    } catch (error) {
      console.error("Error deleting meditation:", error);
      toast.error("Fout bij het verwijderen van meditatie");
      
      // Still update local state
      setMeditations(prev => prev.filter(m => m.id !== id));
    }
  }
  
  return {
    meditations: meditationsData,
    currentMeditation,
    setCurrentMeditation,
    addMeditation,
    updateMeditation,
    deleteMeditation,
    isLoading
  };
}
