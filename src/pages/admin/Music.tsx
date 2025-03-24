
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { useApp } from "@/context/AppContext";
import { 
  Card, 
  CardContent, 
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AudioPlayer } from "@/components/audio-player";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, FileAudio, Image, Tag, Music } from "lucide-react";

import { Soundscape } from "@/lib/types";

const AdminMusic = () => {
  const { soundscapes, addSoundscape, updateSoundscape, deleteSoundscape } = useApp();
  
  // Filter only music items (category "Muziek")
  const musicItems = soundscapes.filter(item => item.category === "Muziek");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMusicItem, setCurrentMusicItem] = useState<Soundscape | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAudioUrl("");
    setCoverImageUrl("");
    setTags([]);
    setTagInput("");
  };
  
  const handleOpenNew = () => {
    setCurrentMusicItem(null);
    resetForm();
    setIsDialogOpen(true);
  };
  
  const handleEdit = (musicItem: Soundscape) => {
    setCurrentMusicItem(musicItem);
    setTitle(musicItem.title);
    setDescription(musicItem.description);
    setAudioUrl(musicItem.audioUrl);
    setCoverImageUrl(musicItem.coverImageUrl);
    setTags([...musicItem.tags]);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm("Weet je zeker dat je dit muziekstuk wilt verwijderen?")) {
      deleteSoundscape(id);
    }
  };
  
  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };
  
  const handleSave = () => {
    if (!title || !description || !audioUrl || !coverImageUrl) {
      alert("Vul alle verplichte velden in");
      return;
    }
    
    if (currentMusicItem) {
      updateSoundscape(currentMusicItem.id, {
        title,
        description,
        audioUrl,
        category: "Muziek", // Always set category to "Muziek"
        coverImageUrl,
        tags,
      });
    } else {
      addSoundscape({
        title,
        description,
        audioUrl,
        category: "Muziek", // Always set category to "Muziek"
        coverImageUrl,
        tags,
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
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
          {musicItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {musicItems.map((musicItem) => (
                <Card key={musicItem.id} className="overflow-hidden">
                  <div className="aspect-video bg-cover bg-center relative">
                    <img 
                      src={musicItem.coverImageUrl} 
                      alt={musicItem.title}
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-medium">{musicItem.title}</h3>
                      <p className="text-white/80 text-sm truncate">
                        {musicItem.description}
                      </p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button 
                        variant="secondary" 
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                        onClick={() => handleEdit(musicItem)}
                      >
                        <Edit className="h-4 w-4 text-white" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                        onClick={() => handleDelete(musicItem.id)}
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </div>
                  <CardFooter className="p-3 bg-background">
                    <AudioPlayer audioUrl={musicItem.audioUrl} showControls={false} />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                Er zijn nog geen muziekstukken. Voeg je eerste muziekstuk toe!
              </p>
              <Button onClick={handleOpenNew}>
                <Music className="h-4 w-4 mr-2" />
                Nieuwe Muziek
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Add/Edit Music Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {currentMusicItem ? "Muziek Bewerken" : "Nieuwe Muziek"}
            </DialogTitle>
            <DialogDescription>
              Vul de details in voor de muziek
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  placeholder="Titel van de muziek"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea
                  id="description"
                  placeholder="Beschrijving van de muziek"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Voeg een tag toe"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddTag}
                  >
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="audioUrl">Audio URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="audioUrl"
                    placeholder="URL naar audio bestand"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    className="shrink-0"
                  >
                    <FileAudio className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coverImageUrl">Cover Afbeelding URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="coverImageUrl"
                    placeholder="URL naar afbeelding"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    className="shrink-0"
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {coverImageUrl && (
                <div className="mt-4 aspect-video bg-cover bg-center rounded-md overflow-hidden relative">
                  <img 
                    src={coverImageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/400x225?text=Invalid+Image+URL";
                    }}
                  />
                </div>
              )}
              
              {audioUrl && (
                <div className="mt-4">
                  <Label>Audio Preview</Label>
                  <AudioPlayer audioUrl={audioUrl} />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleSave}>
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMusic;
