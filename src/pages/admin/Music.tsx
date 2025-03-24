
import React, { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Music, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Upload, 
  Play, 
  Pause, 
  Clock,
  FileAudio,
  Image
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  fetchMusicItems, 
  saveMusicItem, 
  deleteMusicItem, 
  uploadAudioFile, 
  uploadCoverImage 
} from "@/services/musicService";
import { MusicItem } from "@/lib/types";
import { calculateAudioDuration, generateWaveformData } from "@/utils/audioUtils";

const formSchema = z.object({
  title: z.string().min(1, "Titel is verplicht"),
  artist: z.string().min(1, "Artiest is verplicht"),
  description: z.string().min(1, "Beschrijving is verplicht"),
  category: z.string().min(1, "Categorie is verplicht"),
  tags: z.string().optional(),
});

const AdminMusic = () => {
  const { toast } = useToast();
  const [musicList, setMusicList] = useState<MusicItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioProcessing, setIsAudioProcessing] = useState(false);
  const [previewAudio] = useState(new Audio());
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  // Audio file upload refs
  const audioFileRef = useRef<HTMLInputElement>(null);
  const coverImageRef = useRef<HTMLInputElement>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      artist: "",
      description: "",
      category: "",
      tags: "",
    },
  });

  // Fetch music data
  useEffect(() => {
    const loadMusicData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchMusicItems();
        setMusicList(data);
      } catch (error) {
        console.error("Error loading music data:", error);
        toast({
          title: "Error",
          description: "Failed to load music data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMusicData();
  }, []);

  // Handle audio preview playback
  useEffect(() => {
    if (previewUrl) {
      previewAudio.src = previewUrl;
      previewAudio.load();
      
      if (isPlaying) {
        previewAudio.play().catch(console.error);
      } else {
        previewAudio.pause();
      }
    }
    
    return () => {
      previewAudio.pause();
      previewAudio.src = "";
    };
  }, [previewUrl, isPlaying]);

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      
      // Create local preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Update form with file name as default title if we're adding a new item
      if (!isEditing) {
        // Extract name without extension
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        form.setValue("title", fileName);
      }
    }
  };
  
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      
      // Create local preview URL
      const objectUrl = URL.createObjectURL(file);
      setCoverImageUrl(objectUrl);
    }
  };
  
  const processAudioFile = async () => {
    if (!audioFile) return;
    
    setIsAudioProcessing(true);
    
    try {
      // Create a temporary audio element to get duration
      const audio = new Audio(URL.createObjectURL(audioFile));
      const duration = await calculateAudioDuration(audio);
      
      // Upload the file to Supabase
      setUploadProgress(10);
      const audioFileUrl = await uploadAudioFile(audioFile);
      setUploadProgress(70);
      
      if (!audioFileUrl) {
        throw new Error("Failed to upload audio file");
      }
      
      // Upload cover image if provided
      let coverUrl = coverImageUrl;
      if (coverImageFile) {
        const imageUrl = await uploadCoverImage(coverImageFile);
        if (imageUrl) {
          coverUrl = imageUrl;
          setCoverImageUrl(imageUrl);
        }
      }
      
      setUploadProgress(80);
      
      // Generate waveform data
      const waveformData = await generateWaveformData(audioFileUrl);
      
      setUploadProgress(100);
      
      // Update state with the uploaded URLs
      setAudioUrl(audioFileUrl);
      setPreviewUrl(audioFileUrl);
      
      // Create the music item
      const newMusic: Partial<MusicItem> = {
        id: editingId || undefined,
        title: form.getValues("title"),
        artist: form.getValues("artist"),
        description: form.getValues("description"),
        audioUrl: audioFileUrl,
        coverImageUrl: coverUrl,
        category: form.getValues("category"),
        tags: form.getValues("tags") ? form.getValues("tags").split(",").map(tag => tag.trim()) : [],
        duration: Math.round(duration), // Round to nearest second
        waveformData: waveformData,
      };
      
      const savedMusic = await saveMusicItem(newMusic);
      
      if (savedMusic) {
        // Update the music list
        if (editingId) {
          setMusicList(prev => prev.map(m => m.id === editingId ? savedMusic : m));
        } else {
          setMusicList(prev => [...prev, savedMusic]);
        }
        
        // Reset the form and state
        form.reset();
        setIsEditing(false);
        setEditingId(null);
        setAudioFile(null);
        setCoverImageFile(null);
        setAudioUrl("");
        setCoverImageUrl("");
        setPreviewUrl(null);
        setIsPlaying(false);
        
        toast({
          title: "Success",
          description: `Music "${savedMusic.title}" has been saved.`,
        });
      } else {
        throw new Error("Failed to save music item");
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        title: "Error",
        description: "Failed to process audio file",
        variant: "destructive",
      });
    } finally {
      setIsAudioProcessing(false);
      setIsUploadDialogOpen(false);
      setUploadProgress(0);
    }
  };

  const handleAddMusic = (values: z.infer<typeof formSchema>) => {
    if (!audioUrl) {
      toast({
        title: "Error",
        description: "Please upload an audio file first",
        variant: "destructive",
      });
      return;
    }
    
    const newMusic: Partial<MusicItem> = {
      title: values.title,
      artist: values.artist,
      description: values.description,
      audioUrl: audioUrl,
      coverImageUrl: coverImageUrl,
      category: values.category,
      tags: values.tags ? values.tags.split(",").map(tag => tag.trim()) : [],
    };

    saveMusicItem(newMusic).then(savedItem => {
      if (savedItem) {
        setMusicList([...musicList, savedItem]);
        form.reset();
        
        toast({
          title: "Muziek toegevoegd",
          description: `"${savedItem.title}" is succesvol toegevoegd.`,
        });
      }
    }).catch(error => {
      console.error("Error saving music:", error);
      toast({
        title: "Error",
        description: "Failed to save music",
        variant: "destructive",
      });
    });
  };

  const handleEditMusic = (music: MusicItem) => {
    setIsEditing(true);
    setEditingId(music.id);
    setAudioUrl(music.audioUrl);
    setCoverImageUrl(music.coverImageUrl || "");
    setPreviewUrl(music.audioUrl);
    
    form.reset({
      title: music.title,
      artist: music.artist,
      description: music.description,
      category: music.category || "",
      tags: music.tags ? music.tags.join(", ") : "",
    });
  };

  const handleSaveEdit = (values: z.infer<typeof formSchema>) => {
    if (!editingId) return;
    
    const updatedMusic: Partial<MusicItem> = {
      id: editingId,
      title: values.title,
      artist: values.artist,
      description: values.description,
      audioUrl: audioUrl,
      coverImageUrl: coverImageUrl,
      category: values.category,
      tags: values.tags ? values.tags.split(",").map(tag => tag.trim()) : [],
    };

    saveMusicItem(updatedMusic).then(savedItem => {
      if (savedItem) {
        setMusicList(musicList.map(music => music.id === editingId ? savedItem : music));
        setIsEditing(false);
        setEditingId(null);
        setAudioUrl("");
        setCoverImageUrl("");
        setPreviewUrl(null);
        form.reset();
        
        toast({
          title: "Muziek bijgewerkt",
          description: `"${savedItem.title}" is succesvol bijgewerkt.`,
        });
      }
    }).catch(error => {
      console.error("Error updating music:", error);
      toast({
        title: "Error",
        description: "Failed to update music",
        variant: "destructive",
      });
    });
  };

  const handleDeleteMusic = (id: string) => {
    const musicToDelete = musicList.find(music => music.id === id);
    if (!musicToDelete) return;
    
    if (confirm(`Weet je zeker dat je "${musicToDelete.title}" wilt verwijderen?`)) {
      deleteMusicItem(id).then(success => {
        if (success) {
          setMusicList(musicList.filter(music => music.id !== id));
          
          toast({
            title: "Muziek verwijderd",
            description: `"${musicToDelete.title}" is succesvol verwijderd.`,
            variant: "destructive",
          });
        }
      }).catch(error => {
        console.error("Error deleting music:", error);
        toast({
          title: "Error",
          description: "Failed to delete music",
          variant: "destructive",
        });
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setAudioFile(null);
    setCoverImageFile(null);
    setAudioUrl("");
    setCoverImageUrl("");
    setPreviewUrl(null);
    setIsPlaying(false);
    form.reset();
  };

  const handlePreviewToggle = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Muziek Beheer</h1>
          <Music className="h-6 w-6 text-primary" />
        </div>
        
        <p className="text-muted-foreground">
          Voeg rustgevende muziek toe en beheer bestaande nummers
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Muziek bewerken" : "Nieuwe muziek toevoegen"}</CardTitle>
            <CardDescription>
              {isEditing 
                ? "Bewerk de details van het geselecteerde muziekstuk" 
                : "Vul de details in om nieuwe rustgevende muziek toe te voegen"
              }
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(isEditing ? handleSaveEdit : handleAddMusic)}>
              <CardContent className="space-y-4">
                {/* Audio File Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Audio Bestand</label>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsUploadDialogOpen(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Audio
                    </Button>
                    
                    {previewUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handlePreviewToggle}
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </Button>
                    )}
                    
                    {audioUrl && (
                      <span className="text-sm text-muted-foreground">
                        Audio geüpload
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titel</FormLabel>
                        <FormControl>
                          <Input placeholder="Voer titel in" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="artist"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Artiest</FormLabel>
                        <FormControl>
                          <Input placeholder="Voer artiest in" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beschrijving</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Voer een beschrijving in" 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categorie</FormLabel>
                        <FormControl>
                          <Input placeholder="bijv. Natuur, Meditatie, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (komma-gescheiden)</FormLabel>
                        <FormControl>
                          <Input placeholder="bijv. rustig, natuur, regen" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                {isEditing ? (
                  <>
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Annuleren
                    </Button>
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      Bijwerken
                    </Button>
                  </>
                ) : (
                  <Button type="submit" className="ml-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Toevoegen
                  </Button>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Muziek Overzicht</CardTitle>
            <CardDescription>
              Beheer bestaande muziekstukken
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Laden...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titel</TableHead>
                    <TableHead>Artiest</TableHead>
                    <TableHead>Categorie</TableHead>
                    <TableHead>Lengte</TableHead>
                    <TableHead className="w-[120px]">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {musicList.length > 0 ? (
                    musicList.map((music) => (
                      <TableRow key={music.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          {music.coverImageUrl ? (
                            <img 
                              src={music.coverImageUrl} 
                              alt={music.title} 
                              className="w-8 h-8 rounded object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                              <Music className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          {music.title}
                        </TableCell>
                        <TableCell>{music.artist}</TableCell>
                        <TableCell>{music.category}</TableCell>
                        <TableCell>
                          {music.duration 
                            ? `${Math.floor(music.duration / 60)}:${(music.duration % 60).toString().padStart(2, '0')}`
                            : "?:??"}
                        </TableCell>
                        <TableCell className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setPreviewUrl(music.audioUrl);
                              setIsPlaying(true);
                            }}
                            title="Voorbeluisteren"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditMusic(music)}
                            title="Bewerken"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteMusic(music.id)}
                            title="Verwijderen"
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Geen muziekstukken gevonden. Voeg nieuwe muziek toe.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Audio Bestanden Uploaden</DialogTitle>
            <DialogDescription>
              Upload het audiobestand en een optionele cover afbeelding
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Audio Bestand (MP3, WAV)</label>
              <div className="flex items-center gap-2">
                <Input 
                  type="file" 
                  ref={audioFileRef}
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={() => audioFileRef.current?.click()}
                >
                  <FileAudio className="h-4 w-4" />
                </Button>
              </div>
              {audioFile && (
                <p className="text-xs text-muted-foreground">
                  Geselecteerd: {audioFile.name} ({Math.round(audioFile.size / 1024)} KB)
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Afbeelding (Optioneel)</label>
              <div className="flex items-center gap-2">
                <Input 
                  type="file" 
                  ref={coverImageRef}
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={() => coverImageRef.current?.click()}
                >
                  <Image className="h-4 w-4" />
                </Button>
              </div>
              {coverImageFile && (
                <p className="text-xs text-muted-foreground">
                  Geselecteerd: {coverImageFile.name} ({Math.round(coverImageFile.size / 1024)} KB)
                </p>
              )}
              
              {coverImageUrl && (
                <div className="mt-2">
                  <img 
                    src={coverImageUrl} 
                    alt="Cover Preview" 
                    className="h-20 w-20 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            
            {isAudioProcessing && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Verwerking ({uploadProgress}%)</label>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Audio wordt verwerkt, even geduld...
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsUploadDialogOpen(false)}
              disabled={isAudioProcessing}
            >
              Annuleren
            </Button>
            <Button 
              type="button" 
              onClick={processAudioFile}
              disabled={!audioFile || isAudioProcessing}
            >
              {isAudioProcessing ? "Verwerken..." : "Uploaden"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMusic;
