
import React, { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { useApp } from "@/context/AppContext";
import { 
  Card, 
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Music, 
  Volume2
} from "lucide-react";

import { MusicFormDialog } from "@/components/admin/music/MusicFormDialog";
import { Soundscape } from "@/lib/types";
import { AudioPlayer } from "@/components/audio-player";

const AdminSoundscapes = () => {
  const { soundscapes, addSoundscape, updateSoundscape, deleteSoundscape } = useApp();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSoundscape, setCurrentSoundscape] = useState<Soundscape | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleOpenNew = () => {
    setCurrentSoundscape(null);
    setIsDialogOpen(true);
  };
  
  const handleEdit = (soundscape: Soundscape) => {
    setCurrentSoundscape(soundscape);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm("Weet je zeker dat je deze soundscape wilt verwijderen?")) {
      deleteSoundscape(id);
    }
  };
  
  const handleSave = (soundscapeData: Omit<Soundscape, "id">) => {
    if (currentSoundscape) {
      updateSoundscape(currentSoundscape.id, soundscapeData);
    } else {
      addSoundscape(soundscapeData);
    }
    
    setIsDialogOpen(false);
  };
  
  // Filter soundscapes based on search query
  const filteredSoundscapes = soundscapes.filter((soundscape) =>
    soundscape.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    soundscape.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    soundscape.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Soundscapes Beheren</h1>
          <Button onClick={handleOpenNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe Soundscape
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek soundscapes..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <p className="text-muted-foreground text-sm">
            {filteredSoundscapes.length} soundscapes gevonden
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pb-20">
          {filteredSoundscapes.map((soundscape) => (
            <Card key={soundscape.id} className="overflow-hidden group hover:shadow-md transition-all">
              <div className="relative">
                <AspectRatio ratio={1/1}>
                  <img 
                    src={soundscape.coverImageUrl} 
                    alt={soundscape.title}
                    className="w-full h-full object-cover" 
                  />
                </AspectRatio>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2">
                  <h3 className="text-white font-medium text-xs line-clamp-1">{soundscape.title}</h3>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="secondary" 
                    size="icon"
                    className="h-6 w-6 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    onClick={() => handleEdit(soundscape)}
                  >
                    <Edit className="h-3 w-3 text-white" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    className="h-6 w-6 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    onClick={() => handleDelete(soundscape.id)}
                  >
                    <Trash2 className="h-3 w-3 text-white" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-2 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                  <Music className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate max-w-[60px]">{soundscape.title}</span>
                </div>
                <AudioPlayer 
                  audioUrl={soundscape.audioUrl} 
                  showControls={false}
                />
              </CardContent>
            </Card>
          ))}
          
          {/* Empty state */}
          {filteredSoundscapes.length === 0 && (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Geen soundscapes gevonden voor je zoekopdracht." : "Er zijn nog geen soundscapes. Voeg je eerste soundscape toe!"}
              </p>
              {searchQuery ? (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Wis zoekopdracht
                </Button>
              ) : (
                <Button onClick={handleOpenNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe Soundscape
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Add/Edit Soundscape Dialog */}
      <MusicFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        currentMusic={currentSoundscape}
      />
    </AdminLayout>
  );
};

export default AdminSoundscapes;
