
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Soundscape } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

export const useMusicManagement = () => {
  const { setSoundscapes, soundscapes } = useApp();
  const queryClient = useQueryClient();
  const [currentMusic, setCurrentMusic] = useState<Soundscape | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Filter music tracks from soundscapes
  const musicTracks = soundscapes.filter(
    (track) => track.category === "Muziek"
  );

  // Filter tracks based on search query
  const filteredTracks = searchQuery
    ? musicTracks.filter(
        (track) =>
          track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : musicTracks;

  // Query to fetch music tracks from Supabase
  const { isLoading } = useQuery({
    queryKey: ["music"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("soundscapes")
        .select("*")
        .eq("category", "Muziek");

      if (error) {
        throw new Error(error.message);
      }

      // Update app context with fetched soundscapes
      if (data) {
        const formattedData: Soundscape[] = data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description || "",
          audioUrl: item.audio_url,
          category: item.category,
          coverImageUrl: item.cover_image_url,
          tags: item.tags || [],
        }));

        // Merge with existing soundscapes, replacing music category items
        const nonMusicTracks = soundscapes.filter(
          (track) => track.category !== "Muziek"
        );
        setSoundscapes([...nonMusicTracks, ...formattedData]);
        return formattedData;
      }

      return [];
    },
  });

  // Mutation to create or update a music track
  const mutation = useMutation({
    mutationFn: async (music: Partial<Soundscape>) => {
      const isEdit = !!music.id;
      
      const musicData = {
        title: music.title,
        description: music.description,
        audio_url: music.audioUrl,
        category: "Muziek",
        cover_image_url: music.coverImageUrl,
        tags: music.tags || [],
      };

      let result;
      
      if (isEdit && music.id) {
        // Update existing track
        const { data, error } = await supabase
          .from("soundscapes")
          .update(musicData)
          .eq("id", music.id)
          .select();
        
        if (error) throw error;
        result = data?.[0];
      } else {
        // Create new track
        const { data, error } = await supabase
          .from("soundscapes")
          .insert(musicData)
          .select();
        
        if (error) throw error;
        result = data?.[0];
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music"] });
      toast.success(
        currentMusic ? "Muziek bijgewerkt" : "Nieuwe muziek toegevoegd"
      );
      setCurrentMusic(null);
    },
    onError: (error) => {
      console.error("Error saving music:", error);
      toast.error(`Fout bij opslaan: ${error.message}`);
    },
  });

  // Mutation to delete a music track - Handles both UUID and string IDs
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Check if the ID is a UUID format or a string format like "sound-7"
      if (id.startsWith('sound-')) {
        // If it's a sample ID (not from database), just delete from local state
        return id;
      } else {
        // If it's a UUID, attempt to delete from database
        const { error } = await supabase
          .from("soundscapes")
          .delete()
          .eq("id", id);
        
        if (error) throw error;
        return id;
      }
    },
    onSuccess: (id) => {
      // Update local state regardless of ID type
      const updatedSoundscapes = soundscapes.filter(s => s.id !== id);
      setSoundscapes(updatedSoundscapes);
      
      // Only invalidate query for actual database records
      if (!id.startsWith('sound-')) {
        queryClient.invalidateQueries({ queryKey: ["music"] });
      }
      
      toast.success("Muziek verwijderd");
      
      // Stop preview if the deleted track was playing
      if (currentMusic?.id === id && isPlaying) {
        setIsPlaying(false);
        setPreviewUrl(null);
      }
    },
    onError: (error) => {
      console.error("Error deleting music:", error);
      toast.error(`Fout bij verwijderen: ${error.message}`);
    },
  });

  const handleSaveMusic = (music: Partial<Soundscape>) => {
    mutation.mutate(music);
  };

  const handleEditMusic = (music: Soundscape) => {
    setCurrentMusic(music);
  };

  const handleDeleteMusic = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handlePreviewToggle = (track: Soundscape) => {
    if (previewUrl === track.audioUrl && isPlaying) {
      // Stop current preview
      setIsPlaying(false);
      setPreviewUrl(null);
    } else {
      // Start new preview
      setPreviewUrl(track.audioUrl);
      setIsPlaying(true);
    }
  };

  return {
    isLoading,
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
    handlePreviewToggle
  };
};
