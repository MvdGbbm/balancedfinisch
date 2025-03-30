
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

  // Optimized saveMusic function to prevent duplicates
  const handleSaveMusic = (music: Partial<Soundscape>) => {
    const isEdit = !!music.id;
    
    if (isEdit) {
      // For edits, update in the local state directly
      const updatedSoundscapes = soundscapes.map(s => {
        if (s.id === music.id) {
          return {
            ...s,
            ...music
          };
        }
        return s;
      });
      setSoundscapes(updatedSoundscapes);
      
      // Invalidate query to ensure the UI is up to date with server
      queryClient.invalidateQueries({ queryKey: ["music"] });
      
      // Reset current music
      setCurrentMusic(null);
    } else if (music.id) {
      // For new music with server-generated ID, add directly to state
      const newMusic = music as Soundscape;
      // Only add if it doesn't already exist
      if (!soundscapes.some(s => s.id === newMusic.id)) {
        const updatedSoundscapes = [...soundscapes, newMusic];
        setSoundscapes(updatedSoundscapes);
      }
      
      // Reset current music
      setCurrentMusic(null);
    }
  };

  const handleEditMusic = (music: Soundscape) => {
    setCurrentMusic(music);
  };

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
