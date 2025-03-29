
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Soundscape } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useMusicApi() {
  const { setSoundscapes, soundscapes } = useApp();
  const queryClient = useQueryClient();

  const { isLoading } = useQuery({
    queryKey: ["music"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("soundscapes")
          .select("*")
          .eq("category", "Muziek");

        if (error) {
          console.error("Error fetching music:", error);
          throw new Error(error.message);
        }

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

          const nonMusicTracks = soundscapes.filter(
            (track) => track.category !== "Muziek"
          );
          setSoundscapes([...nonMusicTracks, ...formattedData]);
          return formattedData;
        }

        return [];
      } catch (err) {
        console.error("Failed to fetch music tracks:", err);
        toast.error("Kon muziek niet laden. Probeer het later opnieuw.");
        return [];
      }
    },
  });

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
        const { data, error } = await supabase
          .from("soundscapes")
          .update(musicData)
          .eq("id", music.id)
          .select();
        
        if (error) throw error;
        result = data?.[0];
      } else {
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
        "Muziek bijgewerkt"
      );
    },
    onError: (error) => {
      console.error("Error saving music:", error);
      toast.error(`Fout bij opslaan: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("soundscapes")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["music"] });
      
      const updatedSoundscapes = soundscapes.filter(s => s.id !== id);
      setSoundscapes(updatedSoundscapes);
      
      toast.success("Muziek verwijderd");
    },
    onError: (error) => {
      console.error("Error deleting music:", error);
      toast.error(`Fout bij verwijderen: ${error.message}`);
    },
  });

  const handleSaveMusic = (music: Partial<Soundscape>) => {
    mutation.mutate(music);
  };

  const handleDeleteMusic = (id: string) => {
    deleteMutation.mutate(id);
  };

  return {
    isLoading,
    handleSaveMusic,
    handleDeleteMusic
  };
}
