
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Soundscape } from "@/lib/types";
import { saveSoundscapeToSupabase } from "@/components/admin/music/utils/saveSoundscape";
import { toast } from "sonner";

export const useMusicManagement = () => {
  const [tracks, setTracks] = useState<Soundscape[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMusic, setCurrentMusic] = useState<Soundscape | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [categories, setCategories] = useState<string[]>(["Muziek", "Natuur", "Meditatie"]);

  // Fetch music data
  useEffect(() => {
    const fetchMusic = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('soundscapes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Map database fields to Soundscape interface
        const mappedData: Soundscape[] = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          audioUrl: item.audio_url,
          coverImageUrl: item.cover_image_url,
          tags: item.tags || [],
          category: item.category || "Muziek",
          isFavorite: item.is_favorite || false // Fix the type error here
        }));

        setTracks(mappedData);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set([
            "Muziek", 
            ...mappedData.map(item => item.category || "Muziek").filter(Boolean)
          ])
        );
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching music:", error);
        toast.error("Er is een fout opgetreden bij het ophalen van de muziek.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusic();
  }, []);

  // Filter tracks based on search
  const filteredTracks = tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (track.category && track.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle edit music
  const handleEditMusic = (music: Soundscape) => {
    setCurrentMusic(music);
    // Additional edit handling logic
  };

  // Handle save music
  const handleSaveMusic = async (music: Partial<Soundscape>) => {
    try {
      const saveOptions = {
        title: music.title || "",
        description: music.description || "",
        audioUrl: music.audioUrl || "",
        coverImageUrl: music.coverImageUrl || "",
        tags: music.tags || [],
        category: music.category || "Muziek",
        currentMusic: currentMusic,
        isFavorite: music.isFavorite || false
      };

      const { success, data } = await saveSoundscapeToSupabase(saveOptions);

      if (success && data) {
        // Convert database fields to Soundscape interface
        const savedMusic: Soundscape = {
          id: data.id,
          title: data.title,
          description: data.description,
          audioUrl: data.audio_url,
          coverImageUrl: data.cover_image_url,
          tags: data.tags || [],
          category: data.category || "Muziek",
          isFavorite: data.is_favorite || false
        };

        // Update local state
        if (currentMusic) {
          // Update existing music
          setTracks(prev => prev.map(track => 
            track.id === savedMusic.id ? savedMusic : track
          ));
          toast.success("Muziek succesvol bijgewerkt!");
        } else {
          // Add new music
          setTracks(prev => [savedMusic, ...prev]);
          toast.success("Nieuwe muziek succesvol toegevoegd!");
        }

        // Reset current music
        setCurrentMusic(null);
      } else {
        throw new Error("Opslaan mislukt");
      }
    } catch (error) {
      console.error("Error saving music:", error);
      toast.error("Er is een fout opgetreden bij het opslaan van de muziek.");
    }
  };

  // Handle delete music
  const handleDeleteMusic = async (id: string) => {
    try {
      const { error } = await supabase
        .from('soundscapes')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setTracks(prev => prev.filter(track => track.id !== id));
      
      // If the deleted track was being previewed, stop the preview
      if (previewUrl && currentMusic?.id === id) {
        setPreviewUrl(null);
        setIsPlaying(false);
        setCurrentMusic(null);
      }
      
      toast.success("Muziek succesvol verwijderd!");
    } catch (error) {
      console.error("Error deleting music:", error);
      toast.error("Er is een fout opgetreden bij het verwijderen van de muziek.");
    }
  };

  // Handle preview toggle
  const handlePreviewToggle = (track: Soundscape) => {
    if (previewUrl === track.audioUrl && isPlaying) {
      setIsPlaying(false);
    } else {
      setPreviewUrl(track.audioUrl);
      setIsPlaying(true);
    }
  };

  // Category management
  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
      toast.success(`Categorie "${category}" toegevoegd`);
    }
  };

  const deleteCategory = (category: string) => {
    // Prevent deletion of default category
    if (category === "Muziek") {
      toast.error("De standaard categorie 'Muziek' kan niet worden verwijderd.");
      return;
    }
    
    setCategories(prev => prev.filter(cat => cat !== category));
    // Update tracks with the deleted category to use the default
    setTracks(prev => prev.map(track => 
      track.category === category 
        ? { ...track, category: "Muziek" } 
        : track
    ));
    
    toast.success(`Categorie "${category}" verwijderd`);
  };

  return {
    isLoading,
    tracks,
    filteredTracks,
    currentMusic,
    setCurrentMusic,
    searchQuery,
    setSearchQuery,
    previewUrl,
    isPlaying,
    setIsPlaying,
    handleSaveMusic,
    handleEditMusic,
    handleDeleteMusic,
    handlePreviewToggle,
    categories,
    addCategory,
    deleteCategory
  };
};
