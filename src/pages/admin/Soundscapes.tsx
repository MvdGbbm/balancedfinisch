import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AudioPlayer } from "@/components/audio-player";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Play, Plus, FileAudio, Image, Tag, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Soundscape } from "@/lib/types";
import { validateAudioUrl, preloadAudio } from "@/components/audio-player/utils";
const AdminSoundscapes = () => {
  const {
    soundscapes,
    addSoundscape,
    updateSoundscape,
    deleteSoundscape
  } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSoundscape, setCurrentSoundscape] = useState<Soundscape | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [category, setCategory] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isAudioValid, setIsAudioValid] = useState(true);
  const [isValidatingAudio, setIsValidatingAudio] = useState(false);
  const [audioErrorMessage, setAudioErrorMessage] = useState("");

  // Extract unique categories from existing soundscapes
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  useEffect(() => {
    // Get unique categories from all soundscapes
    const categories = [...new Set(soundscapes.map(s => s.category))];
    setAvailableCategories(categories);
  }, [soundscapes]);
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAudioUrl("");
    setCategory("");
    setCoverImageUrl("");
    setTags([]);
    setTagInput("");
    setIsAudioValid(true);
    setAudioErrorMessage("");
  };
  const handleOpenNew = () => {
    setCurrentSoundscape(null);
    resetForm();
    setIsDialogOpen(true);
  };
  const handleEdit = (soundscape: Soundscape) => {
    setCurrentSoundscape(soundscape);
    setTitle(soundscape.title);
    setDescription(soundscape.description);
    setAudioUrl(soundscape.audioUrl);
    setCategory(soundscape.category);
    setCoverImageUrl(soundscape.coverImageUrl);
    setTags([...soundscape.tags]);
    setIsDialogOpen(true);

    // Validate audio when editing
    validateAudioOnChange(soundscape.audioUrl);
  };
  const handleDelete = (id: string) => {
    if (window.confirm("Weet je zeker dat je deze soundscape wilt verwijderen?")) {
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
    setTags(tags.filter(t => t !== tag));
  };
  const validateAudioOnChange = async (url: string) => {
    if (!url) {
      setIsAudioValid(true);
      setAudioErrorMessage("");
      return;
    }
    setIsValidatingAudio(true);
    const validatedUrl = validateAudioUrl(url);
    if (!validatedUrl) {
      setIsAudioValid(false);
      setAudioErrorMessage("Ongeldige audio URL. Gebruik een directe link naar een .mp3, .wav, .ogg, .aac of .m4a bestand.");
      setIsValidatingAudio(false);
      return;
    }
    try {
      const canPlay = await preloadAudio(validatedUrl);
      if (!canPlay) {
        setIsAudioValid(false);
        setAudioErrorMessage("Kon audio niet laden. Controleer of de URL toegankelijk is.");
      } else {
        setIsAudioValid(true);
        setAudioErrorMessage("");
      }
    } catch (error) {
      setIsAudioValid(false);
      setAudioErrorMessage("Er is een fout opgetreden bij het laden van de audio.");
    } finally {
      setIsValidatingAudio(false);
    }
  };
  const handleSave = () => {
    if (!title || !description || !audioUrl || !category || !coverImageUrl) {
      toast.error("Vul alle verplichte velden in");
      return;
    }
    if (!isAudioValid) {
      toast.error("De audio URL is ongeldig. Corrigeer dit eerst.");
      return;
    }
    if (currentSoundscape) {
      updateSoundscape(currentSoundscape.id, {
        title,
        description,
        audioUrl,
        category,
        coverImageUrl,
        tags
      });
    } else {
      addSoundscape({
        title,
        description,
        audioUrl,
        category,
        coverImageUrl,
        tags
      });
    }
    setIsDialogOpen(false);
    resetForm();
  };
  const groupedSoundscapes = soundscapes.reduce((acc, soundscape) => {
    const category = soundscape.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(soundscape);
    return acc;
  }, {} as Record<string, Soundscape[]>);
  return <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Soundscapes Beheren</h1>
          <Button onClick={handleOpenNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe Soundscape
          </Button>
        </div>
        
        <p className="text-muted-foreground">
          Voeg nieuwe soundscapes toe of bewerk bestaande geluiden
        </p>
        
        <div className="space-y-8 pb-20">
          {Object.entries(groupedSoundscapes).map(([category, soundscapesList]) => <div key={category} className="space-y-3">
              <h2 className="text-lg font-medium">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {soundscapesList.map(soundscape => <Card key={soundscape.id} className="overflow-hidden rounded-none">
                    <div className="aspect-video bg-cover bg-center relative max-h-36">
                      <img src={soundscape.coverImageUrl} alt={soundscape.title} className="w-full h-full object-cover" loading="lazy" onError={e => {
                  e.currentTarget.src = "https://via.placeholder.com/300x150?text=Afbeelding+niet+gevonden";
                }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-white font-medium">{soundscape.title}</h3>
                        <p className="text-white/80 text-sm truncate">
                          {soundscape.description}
                        </p>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30" onClick={() => handleEdit(soundscape)}>
                          <Edit className="h-4 w-4 text-white" />
                        </Button>
                        <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30" onClick={() => handleDelete(soundscape.id)}>
                          <Trash2 className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                    </div>
                    <CardFooter className="p-3 bg-background">
                      <AudioPlayer audioUrl={soundscape.audioUrl} showControls={false} />
                    </CardFooter>
                  </Card>)}
              </div>
            </div>)}
          
          {soundscapes.length === 0 && <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                Er zijn nog geen soundscapes. Voeg je eerste soundscape toe!
              </p>
              <Button onClick={handleOpenNew}>
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe Soundscape
              </Button>
            </div>}
        </div>
      </div>
      
      {/* Add/Edit Soundscape Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {currentSoundscape ? "Soundscape Bewerken" : "Nieuwe Soundscape"}
            </DialogTitle>
            <DialogDescription>
              Vul de details in voor de soundscape
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel</Label>
                <Input id="title" placeholder="Titel van de soundscape" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea id="description" placeholder="Beschrijving van de soundscape" value={description} onChange={e => setDescription(e.target.value)} rows={4} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categorie</Label>
                <div className="flex gap-2 items-start">
                  {availableCategories.length > 0 ? <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecteer of typ een categorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.map(cat => <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>)}
                      </SelectContent>
                    </Select> : <Input id="category" placeholder="Categorie" value={category} onChange={e => setCategory(e.target.value)} />}
                </div>
                {availableCategories.length > 0 && <div className="mt-1">
                    <Input id="custom-category" placeholder="Of voer een nieuwe categorie in" value={category} onChange={e => setCategory(e.target.value)} className="mt-2" />
                  </div>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input id="tags" placeholder="Voeg een tag toe" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }} />
                  <Button type="button" onClick={handleAddTag}>
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map(tag => <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-muted-foreground hover:text-foreground">
                        ×
                      </button>
                    </span>)}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="audioUrl">Audio URL <span className="text-red-500">*</span></Label>
                <div className="flex gap-2">
                  <Input id="audioUrl" placeholder="URL naar audio bestand" value={audioUrl} onChange={e => {
                  setAudioUrl(e.target.value);
                  validateAudioOnChange(e.target.value);
                }} className={!isAudioValid ? "border-red-500" : ""} />
                  <Button type="button" variant="outline" className="shrink-0" disabled={isValidatingAudio || !audioUrl}>
                    {isValidatingAudio ? <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" /> : <FileAudio className="h-4 w-4" />}
                  </Button>
                </div>
                {!isAudioValid && audioErrorMessage && <div className="text-xs text-red-500 flex items-center mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {audioErrorMessage}
                  </div>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coverImageUrl">Cover Afbeelding URL <span className="text-red-500">*</span></Label>
                <div className="flex gap-2">
                  <Input id="coverImageUrl" placeholder="URL naar afbeelding" value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} />
                  <Button type="button" variant="outline" className="shrink-0">
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {coverImageUrl && <div className="mt-4 bg-cover bg-center rounded-md overflow-hidden relative h-32">
                  <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" onError={e => {
                e.currentTarget.src = "https://via.placeholder.com/300x150?text=Ongeldige+URL";
                toast.error("Kon de afbeelding niet laden. Controleer de URL.");
              }} />
                </div>}
              
              {audioUrl && isAudioValid && <div className="mt-4">
                  <Label>Audio Preview</Label>
                  <AudioPlayer audioUrl={audioUrl} />
                </div>}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleSave} disabled={!title || !description || !audioUrl || !category || !coverImageUrl || !isAudioValid}>
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>;
};
export default AdminSoundscapes;