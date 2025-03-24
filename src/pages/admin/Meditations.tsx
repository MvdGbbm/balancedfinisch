import React, { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Play, Plus, Clock, FileAudio, Image, ListMusic, MoreVertical, ExternalLink } from "lucide-react";

import { Meditation } from "@/lib/types";

const AdminMeditations = () => {
  const { meditations, addMeditation, updateMeditation, deleteMeditation } = useApp();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [currentMeditation, setCurrentMeditation] = useState<Meditation | null>(null);
  
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
  
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [updatedCategoryName, setUpdatedCategoryName] = useState("");
  
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
  
  const handleOpenNew = () => {
    setCurrentMeditation(null);
    resetForm();
    setIsDialogOpen(true);
  };
  
  const handleEdit = (meditation: Meditation) => {
    setCurrentMeditation(meditation);
    setTitle(meditation.title);
    setDescription(meditation.description);
    setAudioUrl(meditation.audioUrl || "");
    setDuration(meditation.duration);
    setCategory(meditation.category);
    setCoverImageUrl(meditation.coverImageUrl);
    setTags(meditation.category === "Geleide Meditaties" ? [] : [...meditation.tags]);
    setVeraLink(meditation.veraLink || "");
    setMarcoLink(meditation.marcoLink || "");
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm("Weet je zeker dat je deze meditatie wilt verwijderen?")) {
      deleteMeditation(id);
    }
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
    
    const meditationTags = category === "Geleide Meditaties" ? [] : tags;
    
    if (currentMeditation) {
      updateMeditation(currentMeditation.id, {
        title,
        description,
        audioUrl,
        duration,
        category,
        coverImageUrl,
        tags: meditationTags,
        veraLink,
        marcoLink,
      });
    } else {
      addMeditation({
        title,
        description,
        audioUrl,
        duration,
        category,
        coverImageUrl,
        tags: meditationTags,
        veraLink,
        marcoLink,
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };
  
  const categories = Array.from(
    new Set(meditations.map((meditation) => meditation.category))
  ).sort();
  
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    addMeditation({
      title: `${newCategory} Meditatie`,
      description: `Een nieuwe meditatie in de ${newCategory} categorie.`,
      audioUrl: "audio/sample.mp3",
      duration: 10,
      category: newCategory,
      coverImageUrl: "images/sample.jpg",
      tags: newCategory === "Geleide Meditaties" ? [] : [newCategory.toLowerCase()],
    });
    
    setNewCategory("");
    setIsCategoryDialogOpen(false);
  };
  
  const handleUpdateCategory = () => {
    if (!editingCategory || !updatedCategoryName.trim()) return;
    
    meditations
      .filter(m => m.category === editingCategory)
      .forEach(m => {
        let updatedTags = [...m.tags];
        if (updatedCategoryName === "Geleide Meditaties") {
          updatedTags = [];
        } else if (editingCategory === "Geleide Meditaties") {
          updatedTags = [updatedCategoryName.toLowerCase()];
        } else {
          updatedTags = [...m.tags.filter(t => t !== editingCategory.toLowerCase()), updatedCategoryName.toLowerCase()];
        }
        
        updateMeditation(m.id, {
          ...m,
          category: updatedCategoryName,
          tags: updatedTags
        });
      });
    
    setEditingCategory(null);
    setUpdatedCategoryName("");
    setIsCategoryDialogOpen(false);
  };
  
  const handleDeleteCategory = (categoryName: string) => {
    if (window.confirm(`Weet je zeker dat je de categorie "${categoryName}" wilt verwijderen? Alle meditaties in deze categorie worden ook verwijderd.`)) {
      meditations
        .filter(m => m.category === categoryName)
        .forEach(m => {
          deleteMeditation(m.id);
        });
    }
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
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)}>
              <ListMusic className="h-4 w-4 mr-2" />
              Categorieën
            </Button>
            <Button onClick={handleOpenNew}>
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Meditatie
            </Button>
          </div>
        </div>
        
        <p className="text-muted-foreground">
          Voeg nieuwe meditaties toe of bewerk bestaande content
        </p>
        
        <div className="space-y-8 pb-20">
          {Object.entries(groupedMeditations).map(([category, meditationsList]) => (
            <div key={category} className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">{category}</h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => {
                        setEditingCategory(category);
                        setUpdatedCategoryName(category);
                        setIsCategoryDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Bewerk categorie
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDeleteCategory(category)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Verwijder categorie
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
      
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Categorie Bewerken" : "Categorieën Beheren"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? "Wijzig de naam van de categorie" 
                : "Voeg nieuwe categorieën toe of beheer bestaande categorieën"}
            </DialogDescription>
          </DialogHeader>
          
          {editingCategory ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="updatedCategoryName">Nieuwe categorienaam</Label>
                <Input
                  id="updatedCategoryName"
                  placeholder="Voer een nieuwe naam in"
                  value={updatedCategoryName}
                  onChange={(e) => setUpdatedCategoryName(e.target.value)}
                />
              </div>
              
              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingCategory(null);
                    setUpdatedCategoryName("");
                  }}
                >
                  Annuleren
                </Button>
                <Button onClick={handleUpdateCategory}>
                  Bijwerken
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newCategory">Nieuwe categorie</Label>
                <div className="flex gap-2">
                  <Input
                    id="newCategory"
                    placeholder="Voer een categorienaam in"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddCategory}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Bestaande categorieën</Label>
                <div className="space-y-2 mt-2">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <div 
                        key={cat} 
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <span>{cat}</span>
                        <div className="flex items-center gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              setEditingCategory(cat);
                              setUpdatedCategoryName(cat);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleDeleteCategory(cat)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-2">
                      Geen categorieën gevonden
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMeditations;
