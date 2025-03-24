
import React, { useState } from "react";
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
import { Music, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define type for music item
interface MusicItem {
  id: string;
  title: string;
  artist: string;
  description: string;
  audioUrl: string;
  coverImageUrl: string;
  category: string;
  tags: string[];
}

const formSchema = z.object({
  title: z.string().min(1, "Titel is verplicht"),
  artist: z.string().min(1, "Artiest is verplicht"),
  description: z.string().min(1, "Beschrijving is verplicht"),
  audioUrl: z.string().min(1, "Audio URL is verplicht"),
  coverImageUrl: z.string().min(1, "Cover afbeelding URL is verplicht"),
  category: z.string().min(1, "Categorie is verplicht"),
  tags: z.string().optional(),
});

const AdminMusic = () => {
  const { toast } = useToast();
  
  // Sample music data - in a real app, fetch from your API/backend
  const [musicList, setMusicList] = useState<MusicItem[]>([
    {
      id: "1",
      title: "Rustgevende Oceaan",
      artist: "Natuurgeluiden",
      description: "Ontspannende geluiden van oceaangolven",
      audioUrl: "https://example.com/ocean.mp3",
      coverImageUrl: "https://example.com/ocean.jpg",
      category: "Natuur",
      tags: ["oceaan", "golven", "natuur", "ontspanning"],
    },
    {
      id: "2",
      title: "Meditatie Melodie",
      artist: "Zen Sounds",
      description: "Zachte melodie voor diepe meditatie",
      audioUrl: "https://example.com/meditation.mp3",
      coverImageUrl: "https://example.com/meditation.jpg",
      category: "Meditatie",
      tags: ["meditatie", "zen", "kalm", "focus"],
    },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      artist: "",
      description: "",
      audioUrl: "",
      coverImageUrl: "",
      category: "",
      tags: "",
    },
  });

  const handleAddMusic = (values: z.infer<typeof formSchema>) => {
    const newMusic: MusicItem = {
      id: Date.now().toString(),
      title: values.title,
      artist: values.artist,
      description: values.description,
      audioUrl: values.audioUrl,
      coverImageUrl: values.coverImageUrl,
      category: values.category,
      tags: values.tags ? values.tags.split(",").map(tag => tag.trim()) : [],
    };

    setMusicList([...musicList, newMusic]);
    form.reset();
    
    toast({
      title: "Muziek toegevoegd",
      description: `"${newMusic.title}" is succesvol toegevoegd.`,
    });
  };

  const handleEditMusic = (music: MusicItem) => {
    setIsEditing(true);
    setEditingId(music.id);
    form.reset({
      title: music.title,
      artist: music.artist,
      description: music.description,
      audioUrl: music.audioUrl,
      coverImageUrl: music.coverImageUrl,
      category: music.category,
      tags: music.tags.join(", "),
    });
  };

  const handleSaveEdit = (values: z.infer<typeof formSchema>) => {
    const updatedMusicList = musicList.map(music => {
      if (music.id === editingId) {
        return {
          ...music,
          title: values.title,
          artist: values.artist,
          description: values.description,
          audioUrl: values.audioUrl,
          coverImageUrl: values.coverImageUrl,
          category: values.category,
          tags: values.tags ? values.tags.split(",").map(tag => tag.trim()) : [],
        };
      }
      return music;
    });

    setMusicList(updatedMusicList);
    setIsEditing(false);
    setEditingId(null);
    form.reset();
    
    toast({
      title: "Muziek bijgewerkt",
      description: `"${values.title}" is succesvol bijgewerkt.`,
    });
  };

  const handleDeleteMusic = (id: string) => {
    const musicToDelete = musicList.find(music => music.id === id);
    if (musicToDelete) {
      setMusicList(musicList.filter(music => music.id !== id));
      
      toast({
        title: "Muziek verwijderd",
        description: `"${musicToDelete.title}" is succesvol verwijderd.`,
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    form.reset();
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
                    name="audioUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Audio URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://voorbeeld.com/audio.mp3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="coverImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Afbeelding URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://voorbeeld.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titel</TableHead>
                  <TableHead>Artiest</TableHead>
                  <TableHead>Categorie</TableHead>
                  <TableHead className="w-[120px]">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {musicList.length > 0 ? (
                  musicList.map((music) => (
                    <TableRow key={music.id}>
                      <TableCell className="font-medium">{music.title}</TableCell>
                      <TableCell>{music.artist}</TableCell>
                      <TableCell>{music.category}</TableCell>
                      <TableCell className="flex space-x-2">
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
                    <TableCell colSpan={4} className="text-center py-4">
                      Geen muziekstukken gevonden. Voeg nieuwe muziek toe.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminMusic;
