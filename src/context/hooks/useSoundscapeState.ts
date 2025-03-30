
import { useState, useEffect } from "react";
import { Soundscape } from "@/lib/types";
import { toast } from "sonner";
import { 
  fetchSoundscapesFromDb,
  addSoundscapeToDb,
  updateSoundscapeInDb,
  deleteSoundscapeFromDb
} from "@/services/soundscape-service";
import { 
  getSampleSoundscapes,
  createLocalSoundscape
} from "@/utils/soundscape-utils";

export function useSoundscapeState() {
  // Changed variable name to avoid duplicate declaration
  const [soundscapesData, setSoundscapesData] = useState<Soundscape[]>([]);
  const [currentSoundscape, setCurrentSoundscape] = useState<Soundscape | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load soundscapes from Supabase
  useEffect(() => {
    const loadSoundscapes = async () => {
      try {
        setIsLoading(true);
        
        // Try to fetch from Supabase first
        const dbSoundscapes = await fetchSoundscapesFromDb();
        
        if (dbSoundscapes) {
          setSoundscapesData(dbSoundscapes);
        } else {
          console.log("No soundscapes found in database, using sample data");
          
          // Use sample data as fallback
          const sampleData = await getSampleSoundscapes();
          setSoundscapesData(sampleData);
        }
      } catch (error) {
        console.error("Error loading soundscapes:", error);
        toast.error("Fout bij het laden van soundscapes");
        
        // Fallback to sample data on error
        const sampleData = await getSampleSoundscapes();
        setSoundscapesData(sampleData);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSoundscapes();
  }, []);
  
  // CRUD functions for soundscapes
  async function addSoundscape(soundscape: Omit<Soundscape, 'id'>) {
    try {
      // Insert into Supabase
      const newSoundscape = await addSoundscapeToDb(soundscape);
      
      if (newSoundscape) {
        // Update local state
        setSoundscapesData(prev => [...prev, newSoundscape]);
        toast.success("Soundscape toegevoegd");
      }
    } catch (error) {
      console.error("Error adding soundscape:", error);
      toast.error("Fout bij het toevoegen van soundscape");
      
      // Fallback to local-only if Supabase insert fails
      const localSoundscape = createLocalSoundscape(soundscape);
      setSoundscapesData(prev => [...prev, localSoundscape]);
    }
  }
  
  async function updateSoundscape(id: string, soundscape: Partial<Soundscape>) {
    try {
      // Update in Supabase
      await updateSoundscapeInDb(id, soundscape);
      
      // Update local state
      setSoundscapesData(prev => 
        prev.map(s => {
          if (s.id === id) {
            return { ...s, ...soundscape };
          }
          return s;
        })
      );
      
      toast.success("Soundscape bijgewerkt");
    } catch (error) {
      console.error("Error updating soundscape:", error);
      toast.error("Fout bij het bijwerken van soundscape");
      
      // Still update local state even if Supabase update fails
      setSoundscapesData(prev => 
        prev.map(s => (s.id === id ? { ...s, ...soundscape } : s))
      );
    }
  }
  
  async function deleteSoundscape(id: string) {
    try {
      // Delete from Supabase
      await deleteSoundscapeFromDb(id);
      
      // Update local state
      setSoundscapesData(prev => prev.filter(s => s.id !== id));
      toast.success("Soundscape verwijderd");
    } catch (error) {
      console.error("Error deleting soundscape:", error);
      toast.error("Fout bij het verwijderen van soundscape");
      
      // Still update local state even if Supabase delete fails
      setSoundscapesData(prev => prev.filter(s => s.id !== id));
    }
  }
  
  // Method to update all soundscapes at once (for compatibility)
  function updateSoundscapesData(newSoundscapes: Soundscape[]) {
    setSoundscapesData(newSoundscapes);
  }
  
  return {
    soundscapes: soundscapesData,
    currentSoundscape,
    setCurrentSoundscape,
    addSoundscape,
    updateSoundscape,
    deleteSoundscape,
    setSoundscapes: updateSoundscapesData, // Return with original name for backwards compatibility
    isLoading
  };
}
