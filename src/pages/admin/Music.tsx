
import React, { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import { toast } from "sonner";
import { Soundscape } from "@/lib/types";
import { MusicList } from "@/components/admin/music/MusicList";
import { MusicFormDialog } from "@/components/admin/music/MusicFormDialog";

const AdminMusic = () => {
  const { soundscapes, addSoundscape, updateSoundscape, deleteSoundscape } = useApp();
  
  const musicItems = soundscapes.filter(item => item.category === "Muziek");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMusicItem, setCurrentMusicItem] = useState<Soundscape | null>(null);
  
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
    }
  };
  
  const handleSave = (musicData: Partial<Soundscape>) => {
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
      
      addSoundscape(newMusic);
      toast.success("Nieuwe muziek toegevoegd");
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Muziek Beheren</h1>
          <Button onClick={handleOpenNew}>
            <Music className="h-4 w-4 mr-2" />
            Nieuwe Muziek
          </Button>
        </div>
        
        <p className="text-muted-foreground">
          Voeg nieuwe muziek toe of bewerk bestaande muziekstukken
        </p>
        
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
