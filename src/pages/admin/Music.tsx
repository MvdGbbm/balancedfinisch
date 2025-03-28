
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Music, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Soundscape } from "@/lib/types";
import { MusicList } from "@/components/admin/music/MusicList";
import { MusicFormDialog } from "@/components/admin/music/MusicFormDialog";
import { Input } from "@/components/ui/input";
import { validateAudioUrl } from "@/components/audio-player/utils";

const AdminMusic = () => {
  const { soundscapes, addSoundscape, updateSoundscape, deleteSoundscape } = useApp();
  
  const [musicItems, setMusicItems] = useState<Soundscape[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMusicItem, setCurrentMusicItem] = useState<Soundscape | null>(null);
  
  // Filter music items whenever soundscapes or search term changes
  useEffect(() => {
    const filtered = soundscapes
      .filter(item => item.category === "Muziek")
      .filter(item => 
        searchTerm === "" || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    
    setMusicItems(filtered);
  }, [soundscapes, searchTerm]);
  
  const handleOpenNew = () => {
    setCurrentMusicItem(null);
    setIsDialogOpen(true);
  };
  
  const handleEdit = (musicItem: Soundscape) => {
    setCurrentMusicItem(musicItem);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm("Weet je zeker dat je dit muziekstuk wilt verwijderen?")) {
      deleteSoundscape(id);
      toast.success("Muziek verwijderd");
    }
  };
  
  const handleSave = (musicData: Partial<Soundscape>) => {
    try {
      // Validate and fix the audioUrl if needed
      if (musicData.audioUrl) {
        musicData.audioUrl = validateAudioUrl(musicData.audioUrl);
      }
      
      if (currentMusicItem) {
        updateSoundscape(currentMusicItem.id, musicData);
        toast.success("Muziek bijgewerkt");
      } else {
        // Make sure we have all required properties for a new Soundscape
        if (!musicData.title || !musicData.description || !musicData.audioUrl || 
            !musicData.coverImageUrl || !musicData.category) {
          toast.error("Alle verplichte velden moeten ingevuld zijn");
          return;
        }
        
        // Cast to required type with all necessary fields
        const newMusic: Omit<Soundscape, "id"> = {
          title: musicData.title,
          description: musicData.description,
          audioUrl: musicData.audioUrl,
          category: musicData.category || "Muziek",
          coverImageUrl: musicData.coverImageUrl,
          tags: musicData.tags || [],
        };
        
        console.log("Adding new music:", newMusic);
        addSoundscape(newMusic);
        toast.success("Nieuwe muziek toegevoegd");
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving music:", error);
      toast.error("Er is een fout opgetreden bij het opslaan van de muziek");
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold mb-1">Muziek Beheren</h1>
            <p className="text-muted-foreground text-sm">
              Voeg nieuwe muziek toe of bewerk bestaande muziekstukken
            </p>
          </div>
          
          <Button onClick={handleOpenNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe Muziek
          </Button>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Zoek op titel, beschrijving of tags..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="space-y-8 pb-20">
          <MusicList 
            musicItems={musicItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onNew={handleOpenNew}
          />
        </div>
      </div>
      
      <MusicFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        currentMusic={currentMusicItem}
      />
    </AdminLayout>
  );
};

export default AdminMusic;
