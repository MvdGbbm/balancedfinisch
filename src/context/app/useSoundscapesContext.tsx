
import { useState, useEffect } from 'react';
import { Soundscape } from '@/lib/types';
import { generateId } from './utils';
import { supabase } from "@/integrations/supabase/client";
import { soundscapes as initialSoundscapes } from "@/data/soundscapes";

export function useSoundscapesContext() {
  const [soundscapesData, setSoundscapes] = useState<Soundscape[]>(initialSoundscapes);

  // Process soundscape URLs on initial load
  useEffect(() => {
    const processSoundscapeUrls = async () => {
      try {
        console.log("Processing soundscape URLs in AppContext...");
        
        // Check if we have processed URLs in localStorage
        const cachedSoundscapes = localStorage.getItem('processedSoundscapes');
        if (cachedSoundscapes) {
          console.log("Using cached soundscape URLs");
          setSoundscapes(JSON.parse(cachedSoundscapes));
          return;
        }
        
        // Process URLs for all soundscapes
        const processed = await Promise.all(
          soundscapesData.map(async (soundscape) => {
            let audioUrl = soundscape.audioUrl;
            let coverImageUrl = soundscape.coverImageUrl;
            
            // Process audio URL
            if (!audioUrl.startsWith('http')) {
              try {
                const { data: audioData } = await supabase.storage
                  .from('meditations')
                  .getPublicUrl(audioUrl);
                audioUrl = audioData.publicUrl;
                console.log(`Processed audio URL for ${soundscape.title}:`, audioUrl);
              } catch (error) {
                console.error(`Error processing audio URL for ${soundscape.title}:`, error);
              }
            }
            
            // Process cover image URL if it exists
            if (coverImageUrl && !coverImageUrl.startsWith('http')) {
              try {
                const { data: imageData } = await supabase.storage
                  .from('meditations')
                  .getPublicUrl(coverImageUrl);
                coverImageUrl = imageData.publicUrl;
                console.log(`Processed image URL for ${soundscape.title}:`, coverImageUrl);
              } catch (error) {
                console.error(`Error processing cover image URL for ${soundscape.title}:`, error);
              }
            }
            
            return {
              ...soundscape,
              audioUrl,
              coverImageUrl
            };
          })
        );
        
        console.log("Finished processing soundscape URLs:", processed);
        setSoundscapes(processed);
        
        // Cache the processed soundscapes
        localStorage.setItem('processedSoundscapes', JSON.stringify(processed));
      } catch (error) {
        console.error("Error processing soundscape URLs:", error);
      }
    };
    
    processSoundscapeUrls();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('soundscapes', JSON.stringify(soundscapesData));
    } catch (error) {
      console.error('Error saving soundscapes to localStorage:', error);
    }
  }, [soundscapesData]);

  // CRUD functions for soundscapes
  function addSoundscape(soundscape: Omit<Soundscape, 'id'>) {
    const newSoundscape: Soundscape = {
      ...soundscape,
      id: generateId(),
    };
    setSoundscapes([...soundscapesData, newSoundscape]);
  }
  
  function updateSoundscape(id: string, updatedSoundscape: Partial<Soundscape>) {
    setSoundscapes(prevSoundscapes => 
      prevSoundscapes.map(soundscape => 
        soundscape.id === id ? { ...soundscape, ...updatedSoundscape } : soundscape
      )
    );
  }
  
  function deleteSoundscape(id: string) {
    setSoundscapes(soundscapesData.filter((s) => s.id !== id));
  }

  return {
    soundscapesData,
    setSoundscapes,
    addSoundscape,
    updateSoundscape,
    deleteSoundscape
  };
}
