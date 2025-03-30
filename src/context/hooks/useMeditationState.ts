
import { useState, useEffect } from "react";
import { Meditation } from "@/lib/types";
import { meditations as sampleMeditations } from "@/data/meditations";
import { supabase } from "@/integrations/supabase/client";
import { generateId } from "../utils";

export function useMeditationState() {
  const [meditationsData, setMeditations] = useState<Meditation[]>(sampleMeditations);
  const [currentMeditation, setCurrentMeditation] = useState<Meditation | null>(null);
  
  // Process Supabase URLs for meditations on initial load
  useEffect(() => {
    const processMediaUrls = async () => {
      try {
        console.log("Processing meditation URLs in AppContext...");
        
        // Check if we have processed URLs in localStorage
        const cachedMeditations = localStorage.getItem('processedMeditations');
        if (cachedMeditations) {
          console.log("Using cached meditation URLs");
          setMeditations(JSON.parse(cachedMeditations));
          return;
        }
        
        // Process URLs for all meditations
        const processed = await Promise.all(
          meditationsData.map(async (meditation) => {
            let audioUrl = meditation.audioUrl;
            let coverImageUrl = meditation.coverImageUrl;
            
            // Process audio URL
            if (audioUrl && !audioUrl.startsWith('http')) {
              try {
                const { data: audioData } = await supabase.storage
                  .from('meditations')
                  .getPublicUrl(audioUrl);
                audioUrl = audioData.publicUrl;
                console.log(`Processed audio URL for ${meditation.title}:`, audioUrl);
              } catch (error) {
                console.error(`Error processing audio URL for ${meditation.title}:`, error);
              }
            }
            
            // Process cover image URL
            if (!coverImageUrl.startsWith('http')) {
              try {
                const { data: imageData } = await supabase.storage
                  .from('meditations')
                  .getPublicUrl(coverImageUrl);
                coverImageUrl = imageData.publicUrl;
                console.log(`Processed image URL for ${meditation.title}:`, coverImageUrl);
              } catch (error) {
                console.error(`Error processing cover image URL for ${meditation.title}:`, error);
              }
            }
            
            return {
              ...meditation,
              audioUrl,
              coverImageUrl
            };
          })
        );
        
        console.log("Finished processing meditation URLs:", processed);
        setMeditations(processed);
        
        // Cache the processed meditations
        localStorage.setItem('processedMeditations', JSON.stringify(processed));
      } catch (error) {
        console.error("Error processing media URLs:", error);
      }
    };
    
    processMediaUrls();
  }, []);
  
  // CRUD functions for meditations
  function addMeditation(meditation: Omit<Meditation, 'id' | 'createdAt'>) {
    const newMeditation: Meditation = {
      ...meditation,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedMeditations = [...meditationsData, newMeditation];
    setMeditations(updatedMeditations);
    
    // Update the cached processed meditations
    localStorage.setItem('processedMeditations', JSON.stringify(updatedMeditations));
  }
  
  function updateMeditation(id: string, meditation: Partial<Meditation>) {
    const updatedMeditations = meditationsData.map((m) => 
      (m.id === id ? { ...m, ...meditation } : m)
    );
    
    setMeditations(updatedMeditations);
    
    // Update the cached processed meditations
    localStorage.setItem('processedMeditations', JSON.stringify(updatedMeditations));
  }
  
  function deleteMeditation(id: string) {
    const updatedMeditations = meditationsData.filter((m) => m.id !== id);
    setMeditations(updatedMeditations);
    
    // Update the cached processed meditations
    localStorage.setItem('processedMeditations', JSON.stringify(updatedMeditations));
  }
  
  return {
    meditations: meditationsData,
    currentMeditation,
    setCurrentMeditation,
    addMeditation,
    updateMeditation,
    deleteMeditation
  };
}
