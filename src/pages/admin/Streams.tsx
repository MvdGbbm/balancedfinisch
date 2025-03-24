
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radio, Edit, Trash2, Plus, ExternalLink, Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface RadioStream {
  id: string;
  title: string;
  url: string;
  description: string | null;
  is_active: boolean;
}

const AdminStreams = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStream, setCurrentStream] = useState<RadioStream | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  // Fetch streams with React Query
  const { data: streams = [], isLoading } = useQuery({
    queryKey: ['radioStreams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('radio_streams')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Derived state from streams data
  const activeStreams = streams.filter(stream => stream.is_active);
  const inactiveStreams = streams.filter(stream => !stream.is_active);
  
  // Mutations
  const createStreamMutation = useMutation({
    mutationFn: async (newStream: Omit<RadioStream, 'id'>) => {
      const { data, error } = await supabase
        .from('radio_streams')
        .insert(newStream)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radioStreams'] });
      toast.success("Nieuwe radiostream toegevoegd");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Error creating stream:", error);
      toast.error("Kon de radiostream niet opslaan");
    }
  });
  
  const updateStreamMutation = useMutation({
    mutationFn: async (stream: RadioStream) => {
      const { error } = await supabase
        .from('radio_streams')
        .update({
          title: stream.title,
          url: stream.url,
          description: stream.description,
          is_active: stream.is_active
        })
        .eq('id', stream.id);
      
      if (error) throw error;
      return stream;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radioStreams'] });
      toast.success("Radiostream bijgewerkt");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Error updating stream:", error);
      toast.error("Kon de radiostream niet bijwerken");
    }
  });
  
  const deleteStreamMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('radio_streams')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radioStreams'] });
      toast.success("Radiostream verwijderd");
    },
    onError: (error) => {
      console.error("Error deleting stream:", error);
      toast.error("Kon de radiostream niet verwijderen");
    }
  });
  
  const toggleStreamActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
      const { error } = await supabase
        .from('radio_streams')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
      return { id, isActive };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['radioStreams'] });
      toast.success(`Radiostream ${data.isActive ? 'geactiveerd' : 'gedeactiveerd'}`);
    },
    onError: (error) => {
      console.error("Error updating stream status:", error);
      toast.error("Kon de status niet bijwerken");
    }
  });
  
  const resetForm = () => {
    setTitle("");
    setUrl("");
    setDescription("");
    setIsActive(true);
  };
  
  const handleOpenNew = () => {
    setCurrentStream(null);
    resetForm();
    setIsDialogOpen(true);
  };
  
  const handleEdit = (stream: RadioStream) => {
    setCurrentStream(stream);
    setTitle(stream.title);
    setUrl(stream.url);
    setDescription(stream.description || "");
    setIsActive(stream.is_active);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Weet je zeker dat je deze radiostream wilt verwijderen?")) {
      deleteStreamMutation.mutate(id);
    }
  };
  
  const handleToggleActive = async (stream: RadioStream) => {
    toggleStreamActiveMutation.mutate({ 
      id: stream.id, 
      isActive: !stream.is_active 
    });
  };
  
  const handleSave = async () => {
    if (!title || !url) {
      toast.error("Vul alle verplichte velden in");
      return;
    }
    
    if (currentStream) {
      // Update existing stream
      updateStreamMutation.mutate({
        ...currentStream,
        title,
        url,
        description,
        is_active: isActive
      });
    } else {
      // Create new stream
      createStreamMutation.mutate({
        title,
        url,
        description,
        is_active: isActive
      });
    }
  };
  
  const isValidUrl = (url: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Radiostreams Beheren</h1>
          <Button onClick={handleOpenNew}>
            <Radio className="h-4 w-4 mr-2" />
            Nieuwe Stream
          </Button>
        </div>
        
        <p className="text-muted-foreground">
          Beheer radiostreams die gebruikers kunnen afspelen in de muziekspeler
        </p>
        
        <Tabs defaultValue="active" className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Actieve Streams ({activeStreams.length})</TabsTrigger>
            <TabsTrigger value="inactive">Inactieve Streams ({inactiveStreams.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : activeStreams.length > 0 ? (
              <div className="space-y-2">
                {activeStreams.map((stream) => (
                  <StreamCard 
                    key={stream.id} 
                    stream={stream} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">Geen actieve radiostreams gevonden</p>
                <Button variant="outline" className="mt-2" onClick={handleOpenNew}>
                  Stream toevoegen
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="inactive">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : inactiveStreams.length > 0 ? (
              <div className="space-y-2">
                {inactiveStreams.map((stream) => (
                  <StreamCard 
                    key={stream.id} 
                    stream={stream} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">Geen inactieve radiostreams gevonden</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add/Edit Stream Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentStream ? "Radiostream Bewerken" : "Nieuwe Radiostream"}
            </DialogTitle>
            <DialogDescription>
              Vul de details in voor de radiostream
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                placeholder="Naam van de radiostream"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url">Stream URL</Label>
              <Input
                id="url"
                placeholder="URL naar de audiostream (bijv. https://voorbeeld.com/stream.mp3)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              {isValidUrl(url) && (
                <div className="text-xs text-muted-foreground flex items-center mt-1">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  URL naar een audio stream
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Beschrijving (optioneel)</Label>
              <Textarea
                id="description"
                placeholder="Korte beschrijving van de radiostream"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="is-active">Actief</Label>
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

interface StreamCardProps {
  stream: RadioStream;
  onEdit: (stream: RadioStream) => void;
  onDelete: (id: string) => void;
  onToggleActive: (stream: RadioStream) => void;
}

const StreamCard: React.FC<StreamCardProps> = ({ stream, onEdit, onDelete, onToggleActive }) => {
  return (
    <Card className={stream.is_active ? "" : "opacity-70"}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center">
              <Radio className="h-4 w-4 mr-2 text-primary" />
              <h3 className="font-medium">{stream.title}</h3>
              {!stream.is_active && <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded-sm">Inactief</span>}
            </div>
            {stream.description && (
              <p className="text-sm text-muted-foreground">{stream.description}</p>
            )}
            <p className="text-xs text-blue-500 hover:underline break-all">
              <a href={stream.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                <ExternalLink className="h-3 w-3 mr-1 inline-block flex-shrink-0" />
                <span>{stream.url}</span>
              </a>
            </p>
          </div>
          
          <div className="flex gap-1 ml-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => onToggleActive(stream)}
              title={stream.is_active ? "Deactiveren" : "Activeren"}
            >
              {stream.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(stream)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(stream.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminStreams;
