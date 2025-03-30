
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Radio, Plus, Play, Pause, Pencil, Trash, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface StreamSource {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  isPlaying?: boolean;
}

// Mock streaming sources
const mockStreams: StreamSource[] = [
  {
    id: "1",
    name: "Radio 1",
    url: "https://example.com/radio1.m3u8",
    description: "Nieuws en actualiteiten",
    category: "Nieuws"
  },
  {
    id: "2",
    name: "Radio 2",
    url: "https://example.com/radio2.m3u8",
    description: "Muziek en entertainment",
    category: "Muziek" 
  },
  {
    id: "3",
    name: "Radio 3",
    url: "https://example.com/radio3.m3u8",
    description: "Klassieke muziek",
    category: "Klassiek"
  },
  {
    id: "4",
    name: "Radio 4",
    url: "https://example.com/radio4.m3u8",
    description: "Jazz en blues",
    category: "Jazz"
  }
];

export const StreamingTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [streams, setStreams] = useState<StreamSource[]>(mockStreams);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStream, setNewStream] = useState<Partial<StreamSource>>({});
  const [editingStreamId, setEditingStreamId] = useState<string | null>(null);
  const { toast } = useToast();

  // Filter streams based on search
  const filteredStreams = streams.filter(stream => 
    stream.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stream.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stream.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStream = () => {
    setNewStream({});
    setEditingStreamId(null);
    setIsDialogOpen(true);
  };

  const handleEditStream = (stream: StreamSource) => {
    setNewStream(stream);
    setEditingStreamId(stream.id);
    setIsDialogOpen(true);
  };

  const handleDeleteStream = (id: string) => {
    setStreams(streams.filter(stream => stream.id !== id));
    toast({
      title: "Stream verwijderd",
      description: "De streaming bron is succesvol verwijderd"
    });
  };

  const handleSaveStream = () => {
    if (!newStream.name || !newStream.url) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Vul alle verplichte velden in"
      });
      return;
    }

    if (editingStreamId) {
      // Update existing stream
      setStreams(streams.map(stream => 
        stream.id === editingStreamId ? {...stream, ...newStream} : stream
      ));
      toast({
        title: "Stream bijgewerkt",
        description: `${newStream.name} is succesvol bijgewerkt`
      });
    } else {
      // Add new stream
      const streamToAdd = {
        ...newStream,
        id: `stream-${Date.now()}`
      } as StreamSource;
      setStreams([...streams, streamToAdd]);
      toast({
        title: "Stream toegevoegd",
        description: `${newStream.name} is succesvol toegevoegd`
      });
    }
    
    setIsDialogOpen(false);
  };

  const togglePlayStream = (id: string) => {
    setStreams(streams.map(stream => {
      if (stream.id === id) {
        return {...stream, isPlaying: !stream.isPlaying};
      } else {
        return {...stream, isPlaying: false};
      }
    }));

    const targetStream = streams.find(stream => stream.id === id);
    if (targetStream) {
      toast({
        title: targetStream.isPlaying ? "Stream gepauzeerd" : "Stream gestart",
        description: targetStream.isPlaying 
          ? `${targetStream.name} is gepauzeerd` 
          : `${targetStream.name} wordt nu afgespeeld`
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" />
          <span>Streaming Links</span>
        </h2>

        <div className="flex gap-2 w-full md:w-auto">
          <Input 
            placeholder="Zoeken..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={handleAddStream}>
            <Plus className="h-4 w-4 mr-2" />
            Toevoegen
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStreams.map(stream => (
            <Card key={stream.id} className={`overflow-hidden hover:shadow-md transition-all ${stream.isPlaying ? 'border-primary' : ''}`}>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base flex items-center gap-2">
                    {stream.name}
                    {stream.isPlaying && (
                      <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                        Live
                      </Badge>
                    )}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePlayStream(stream.id)}
                  >
                    {stream.isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <CardDescription>{stream.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <ExternalLink className="h-3 w-3" />
                  <span className="truncate">{stream.url}</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <Badge variant="outline">{stream.category}</Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditStream(stream)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteStream(stream.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStreamId ? 'Stream bewerken' : 'Nieuwe streaming link'}
            </DialogTitle>
            <DialogDescription>
              {editingStreamId 
                ? 'Bewerk de details van deze streaming bron.' 
                : 'Voeg een nieuwe streaming bron toe aan je bibliotheek.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Naam</Label>
              <Input 
                id="name" 
                value={newStream.name || ''} 
                onChange={(e) => setNewStream({...newStream, name: e.target.value})}
                placeholder="Voer de naam in"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="url">Stream URL</Label>
              <Input 
                id="url" 
                value={newStream.url || ''} 
                onChange={(e) => setNewStream({...newStream, url: e.target.value})}
                placeholder="https://example.com/stream.m3u8"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Beschrijving</Label>
              <Input 
                id="description" 
                value={newStream.description || ''} 
                onChange={(e) => setNewStream({...newStream, description: e.target.value})}
                placeholder="Korte beschrijving"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Categorie</Label>
              <Input 
                id="category" 
                value={newStream.category || ''} 
                onChange={(e) => setNewStream({...newStream, category: e.target.value})}
                placeholder="Bijv. Nieuws, Muziek, etc."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleSaveStream}>
              {editingStreamId ? 'Opslaan' : 'Toevoegen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
