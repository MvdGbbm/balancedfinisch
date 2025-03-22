
import React, { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { useApp } from "@/context/AppContext";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle
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
import { Edit, Trash2, Play, Plus, Clock, FileAudio, Image, Tag } from "lucide-react";

import { Meditation } from "@/lib/types";

const AdminMeditations = () => {
  const { meditations, addMeditation, updateMeditation, deleteMeditation } = useApp();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMeditation, setCurrentMeditation] = useState<Meditation | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [duration, setDuration] = useState<number>(10);
  const [category, setCategory] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAudioUrl("");
    setDuration(10);
    setCategory("");
    setCoverImageUrl("");
    setTags([]);
    setTagInput("");
  };
  
  const handleOpenNew = () => {
    setCurrentMeditation(null);
    resetForm();
    setIsDialogOpen(true);
  };
  
  const handleEdit = (meditation: Meditation) => {
    setCurrentMeditation(meditation);
    setTitle(meditation.title);
    setDescription(meditation.description);
    setAudioUrl(meditation.audioUrl);
    setDuration(meditation.duration);
    setCategory(meditation.category);
    setCoverImageUrl(meditation.coverImageUrl);
    setTags([...meditation.tags]);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm("Weet je zeker dat je deze meditatie wilt verwijderen?")) {
      deleteMeditation(id);
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
    if (!title || !description || !audioUrl || !category || !coverImageUrl) {
      alert("Vul alle verplichte velden in");
      return;
    }
    
    if (currentMeditation) {
      updateMeditation(currentMeditation.id, {
        title,
        description,
        audioUrl,
        duration,
        category,
        coverImageUrl,
        tags,
      });
    } else {
      addMeditation({
        title,
        description,
        audioUrl,
        duration,
        category,
        coverImageUrl,
        tags,
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };
  
  const groupedMeditations = meditations.reduce((acc, meditation) => {
    const category = meditation.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(meditation);
    return acc;
  }, {} as Record<string, Meditation[]>);
  
  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Meditaties Beheren</h1>
          <Button onClick={handleOpenNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe Meditatie
          </Button>
        </div>
        
        <p className="text-muted-foreground">
          Voeg nieuwe meditaties toe of bewerk bestaande content
        </p>
        
        <div className="space-y-8 pb-20">
          {Object.entries(groupedMeditations).map(([category, meditationsList]) => (
            <div key={category} className="space-y-3">
              <h2 className="text-lg font-medium">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {meditationsList.map((meditation) => (
                  <Card key={meditation.id} className="overflow-hidden">
                    <div className="aspect-video bg-cover bg-center relative">
                      <img 
                        src={meditation.coverImageUrl} 
                        alt={meditation.title}
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-white font-medium">{meditation.title}</h3>
                        <div className="flex items-center text-white/80 text-sm gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{meditation.duration} min</span>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button 
                          variant="secondary" 
                          size="icon"
                          className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                          onClick={() => handleEdit(meditation)}
                        >
                          <Edit className="h-4 w-4 text-white" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                          onClick={() => handleDelete(meditation.id)}
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                    </div>
                    <CardFooter className="p-3 bg-background">
                      <AudioPlayer audioUrl={meditation.audioUrl} showControls={false} />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
          
          {meditations.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                Er zijn nog geen meditaties. Voeg je eerste meditatie toe!
              </p>
              <Button onClick={handleOpenNew}>
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe Meditatie
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Add/Edit Meditation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {currentMeditation ? "Meditatie Bewerken" : "Nieuwe Meditatie"}
            </DialogTitle>
            <DialogDescription>
              Vul de details in voor de meditatie
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  placeholder="Titel van de meditatie"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea
                  id="description"
                  placeholder="Beschrijving van de meditatie"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categorie</Label>
                  <Input
                    id="category"
                    placeholder="Categorie"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duur (minuten)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="Duur in minuten"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  />
                </div>
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

export default AdminMeditations;
