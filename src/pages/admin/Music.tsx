import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { MusicFormDialog } from "@/components/admin/music/MusicFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  PlusCircle, 
  Search, 
  Music, 
  Play, 
  Pencil, 
  Trash2, 
  Volume2,
  VolumeX
} from "lucide-react";
import { Soundscape } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminMusic = () => {
  const { setSoundscapes, soundscapes } = useApp();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentMusic, setCurrentMusic] = useState<Soundscape | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const musicTracks = soundscapes.filter(
    (track) => track.category === "Muziek"
  );

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
        currentMusic ? "Muziek bijgewerkt" : "Nieuwe muziek toegevoegd"
      );
      setCurrentMusic(null);
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
    setIsEditDialogOpen(true);
  };

  const handleDeleteMusic = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handlePreviewToggle = (track: Soundscape) => {
    if (previewUrl === track.audioUrl && isPlaying) {
      setIsPlaying(false);
      setPreviewUrl(null);
    } else {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
      }
      
      setPreviewUrl(track.audioUrl);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && previewUrl) {
        audioRef.current.src = previewUrl;
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
          toast.error("Kon audio niet afspelen");
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, previewUrl]);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Muziek</h2>
            </div>
            <p className="text-muted-foreground">
              Beheer ontspannende muziek voor de app.
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nieuwe Muziek
          </Button>
        </div>

        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Zoek op titel, beschrijving of tags..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex h-24 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
            <Music className="h-8 w-8 text-muted-foreground" />
            <h3 className="text-lg font-medium">Geen muziek gevonden</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Probeer een andere zoekopdracht."
                : "Er is nog geen muziek toegevoegd. Klik op 'Nieuwe Muziek' om te beginnen."}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: "40%" }}>Titel</TableHead>
                  <TableHead style={{ width: "20%" }}>Tags</TableHead>
                  <TableHead>Audio Preview</TableHead>
                  <TableHead style={{ width: "120px" }}>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTracks.map((track) => (
                  <TableRow key={track.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-md">
                          <img
                            src={track.coverImageUrl}
                            alt={track.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/40x40?text=Error";
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{track.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {track.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {track.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handlePreviewToggle(track)}
                      >
                        {previewUrl === track.audioUrl && isPlaying ? (
                          <>
                            <VolumeX className="h-4 w-4" /> Stop
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" /> Luister
                          </>
                        )}
                      </Button>
                      {previewUrl === track.audioUrl && isPlaying && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center">
                          <Volume2 className="h-3 w-3 mr-1 animate-pulse text-primary" />
                          <span>Nu spelend</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditMusic(track)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Muziek verwijderen</AlertDialogTitle>
                              <AlertDialogDescription>
                                Weet je zeker dat je "{track.title}" wilt verwijderen?
                                Dit kan niet ongedaan worden gemaakt.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuleren</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteMusic(track.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Verwijderen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <MusicFormDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleSaveMusic}
        currentMusic={null}
      />

      <MusicFormDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveMusic}
        currentMusic={currentMusic}
      />

      <audio ref={audioRef} style={{ display: "none" }} />
    </AdminLayout>
  );
};

export default AdminMusic;
