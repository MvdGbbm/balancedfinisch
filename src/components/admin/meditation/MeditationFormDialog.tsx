import React, { useState } from "react";
import { Meditation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AudioPlayer } from "@/components/audio-player";
import { FileAudio, Image, ExternalLink, Plus } from "lucide-react";
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

interface MeditationFormDialogProps {
  meditation: Meditation | null;
  categories: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (meditationData: Partial<Meditation>) => void;
}

export function MeditationFormDialog({
  meditation,
  categories,
  isOpen,
  onOpenChange,
  onSave,
}: MeditationFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [duration, setDuration] = useState<number>(10);
  const [category, setCategory] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [veraLink, setVeraLink] = useState("");
  const [marcoLink, setMarcoLink] = useState("");

  React.useEffect(() => {
    if (meditation) {
      setTitle(meditation.title);
      setDescription(meditation.description);
      setAudioUrl(meditation.audioUrl || "");
      setDuration(meditation.duration);
      setCategory(meditation.category);
      setCoverImageUrl(meditation.coverImageUrl);
      setTags(meditation.category === "Geleide Meditaties" ? [] : [...meditation.tags]);
      setVeraLink(meditation.veraLink || "");
      setMarcoLink(meditation.marcoLink || "");
    } else {
      resetForm();
    }
  }, [meditation, isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAudioUrl("");
    setDuration(10);
    setCategory("");
    setCoverImageUrl("");
    setTags([]);
    setTagInput("");
    setVeraLink("");
    setMarcoLink("");
  };

  const handleAddTag = () => {
    if (category === "Geleide Meditaties") return;
    
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };
  
  const handleSave = () => {
    if (!title || !description || !category || !coverImageUrl) {
      alert("Vul alle verplichte velden in");
      return;
    }
    
    const processUrl = (url: string): string => {
      if (!url) return "";
      
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url.replace(/^\/\//, '');
      }
      
      return url;
    };
    
    const processedAudioUrl = processUrl(audioUrl);
    const processedCoverImageUrl = processUrl(coverImageUrl);
    const processedVeraLink = processUrl(veraLink);
    const processedMarcoLink = processUrl(marcoLink);
    
    const meditationTags = category === "Geleide Meditaties" ? [] : tags;
    
    onSave({
      title,
      description,
      audioUrl: processedAudioUrl,
      duration,
      category,
      coverImageUrl: processedCoverImageUrl,
      tags: meditationTags,
      veraLink: processedVeraLink,
      marcoLink: processedMarcoLink,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {meditation ? "Meditatie Bewerken" : "Nieuwe Meditatie"}
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
                <Select 
                  value={category} 
                  onValueChange={(val) => {
                    setCategory(val);
                    if (val === "Geleide Meditaties") {
                      setTags([]);
                    }
                  }}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecteer categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="nieuwe-categorie" disabled>
                        Geen categorieën beschikbaar
                      </SelectItem>
                    )}
                    <SelectItem value="nieuwe-categorie">
                      <Input 
                        placeholder="Nieuwe categorie" 
                        value={category}
                        onChange={(e) => {
                          e.stopPropagation();
                          setCategory(e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                    </SelectItem>
                  </SelectContent>
                </Select>
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
            
            {category !== "Geleide Meditaties" && (
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
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
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
            
            <div className="space-y-2">
              <Label htmlFor="veraLink">Vera Link</Label>
              <div className="flex gap-2">
                <Input
                  id="veraLink"
                  placeholder="URL voor Vera link"
                  value={veraLink}
                  onChange={(e) => setVeraLink(e.target.value)}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  className="shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="marcoLink">Marco Link</Label>
              <div className="flex gap-2">
                <Input
                  id="marcoLink"
                  placeholder="URL voor Marco link"
                  value={marcoLink}
                  onChange={(e) => setMarcoLink(e.target.value)}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  className="shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
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
                    e.currentTarget.src = "/placeholder.svg";
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuleren
          </Button>
          <Button onClick={handleSave}>
            Opslaan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
