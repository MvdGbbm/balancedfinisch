
import React, { useState } from "react";
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
import { Link2, Edit, Trash2, ExternalLink, Check, X, Radio, Play, GripVertical, Save, Image, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface RadioStream {
  id: string;
  title: string;
  url: string;
  description: string | null;
  is_active: boolean;
  position: number | null;
  cover_image_url: string | null;
}

const AdminStreams = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStream, setCurrentStream] = useState<RadioStream | null>(null);
  
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [pendingOrderChanges, setPendingOrderChanges] = useState(false);
  const [reorderedStreams, setReorderedStreams] = useState<RadioStream[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { data: streams = [], isLoading } = useQuery({
    queryKey: ['radioStreams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('radio_streams')
        .select('*')
        .order('position');
      
      if (error) throw error;
      return data || [];
    }
  });
  
  const activeStreams = streams.filter(stream => stream.is_active);
  const inactiveStreams = streams.filter(stream => !stream.is_active);
  
  const createStreamMutation = useMutation({
    mutationFn: async (newStream: Omit<RadioStream, 'id' | 'position'>) => {
      const maxPosition = streams.length > 0 
        ? Math.max(...streams.map(s => s.position || 0)) + 1 
        : 0;
      
      // Handle image upload if an image is selected
      let coverImageUrl = null;
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('public')
          .upload(`stream-images/${fileName}`, imageFile);
        
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('public')
          .getPublicUrl(`stream-images/${fileName}`);
          
        coverImageUrl = publicUrlData.publicUrl;
      }
      
      const { data, error } = await supabase
        .from('radio_streams')
        .insert({ 
          ...newStream, 
          position: maxPosition,
          cover_image_url: coverImageUrl
        })
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radioStreams'] });
      toast.success("Nieuwe streaming link toegevoegd");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Error creating link:", error);
      toast.error("Kon de streaming link niet opslaan");
    }
  });
  
  const updateStreamMutation = useMutation({
    mutationFn: async (stream: RadioStream) => {
      let coverImageUrl = stream.cover_image_url;
      
      // Handle image upload if an image is selected
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('public')
          .upload(`stream-images/${fileName}`, imageFile);
        
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('public')
          .getPublicUrl(`stream-images/${fileName}`);
          
        coverImageUrl = publicUrlData.publicUrl;
      }
      
      const { error } = await supabase
        .from('radio_streams')
        .update({
          title: stream.title,
          url: stream.url,
          description: stream.description,
          is_active: stream.is_active,
          cover_image_url: coverImageUrl
        })
        .eq('id', stream.id);
      
      if (error) throw error;
      return { ...stream, cover_image_url: coverImageUrl };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radioStreams'] });
      toast.success("Streaming link bijgewerkt");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Error updating link:", error);
      toast.error("Kon de streaming link niet bijwerken");
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
      toast.success("Streaming link verwijderd");
    },
    onError: (error) => {
      console.error("Error deleting link:", error);
      toast.error("Kon de streaming link niet verwijderen");
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
      toast.success(`Streaming link ${data.isActive ? 'geactiveerd' : 'gedeactiveerd'}`);
    },
    onError: (error) => {
      console.error("Error updating link status:", error);
      toast.error("Kon de status niet bijwerken");
    }
  });
  
  const saveOrderMutation = useMutation({
    mutationFn: async (streamsToUpdate: RadioStream[]) => {
      const updatePromises = streamsToUpdate.map((stream, index) => 
        supabase
          .from('radio_streams')
          .update({ position: index })
          .eq('id', stream.id)
      );
      
      await Promise.all(updatePromises);
      return streamsToUpdate;
    },
    onSuccess: (orderedStreams) => {
      queryClient.setQueryData(['radioStreams'], (oldData: RadioStream[] | undefined) => {
        if (!oldData) return orderedStreams;
        
        const inactiveStreams = oldData.filter(stream => !stream.is_active);
        return [...orderedStreams, ...inactiveStreams];
      });
      
      toast.success("Volgorde van streaming links opgeslagen");
      setPendingOrderChanges(false);
      setReorderedStreams([]);
    },
    onError: (error) => {
      console.error("Error saving stream order:", error);
      toast.error("Kon de volgorde niet opslaan");
    }
  });
  
  const resetForm = () => {
    setTitle("");
    setUrl("");
    setDescription("");
    setIsActive(true);
    setImageFile(null);
    setImagePreview(null);
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
    setImagePreview(stream.cover_image_url);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Weet je zeker dat je deze streaming link wilt verwijderen?")) {
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
      updateStreamMutation.mutate({
        ...currentStream,
        title,
        url,
        description,
        is_active: isActive
      });
    } else {
      createStreamMutation.mutate({
        title,
        url,
        description,
        is_active: isActive,
        cover_image_url: null
      });
    }
  };
  
  const handleSaveOrder = () => {
    if (!pendingOrderChanges || reorderedStreams.length === 0) return;
    saveOrderMutation.mutate(reorderedStreams);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(currentStream?.cover_image_url || null);
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
  
  const isValidAudioUrl = (url: string) => {
    if (!isValidUrl(url)) return false;
    
    const lowercaseUrl = url.toLowerCase();
    const audioExtensions = ['.mp3', '.aac', '.ogg', '.m3u', '.m3u8', '.pls', '.xspf'];
    const streamingServices = ['icecast', 'shoutcast', 'radio', 'stream', 'listen', 'audio'];
    
    return audioExtensions.some(ext => lowercaseUrl.includes(ext)) || 
           streamingServices.some(service => lowercaseUrl.includes(service));
  };
  
  const handleDragEnd = async (result: any) => {
    const { destination, source } = result;
    
    if (!destination || (destination.index === source.index)) {
      return;
    }
    
    const updatedStreams = Array.from(activeStreams);
    
    const [reorderedItem] = updatedStreams.splice(source.index, 1);
    
    updatedStreams.splice(destination.index, 0, reorderedItem);
    
    const updatedStreamsWithPositions = updatedStreams.map((stream, index) => ({
      ...stream,
      position: index
    }));
    
    setReorderedStreams(updatedStreamsWithPositions);
    setPendingOrderChanges(true);
    
    queryClient.setQueryData(['radioStreams'], (oldData: RadioStream[] | undefined) => {
      if (!oldData) return oldData;
      const inactiveStreams = oldData.filter(stream => !stream.is_active);
      return [...updatedStreamsWithPositions, ...inactiveStreams];
    });
  };
  
  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Streaming Beheren</h1>
          <div className="flex gap-2">
            {pendingOrderChanges && (
              <Button 
                onClick={handleSaveOrder}
                variant="outline"
                className="flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                Volgorde Opslaan
              </Button>
            )}
            <Button onClick={handleOpenNew}>
              <Radio className="h-4 w-4 mr-2" />
              Nieuwe Streaming Link
            </Button>
          </div>
        </div>
        
        <p className="text-muted-foreground">
          Beheer streaming links die gebruikers kunnen afspelen vanuit de muziekspeler
        </p>
        
        <Tabs defaultValue="active" className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Actieve Links ({activeStreams.length})</TabsTrigger>
            <TabsTrigger value="inactive">Inactieve Links ({inactiveStreams.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : activeStreams.length > 0 ? (
              <div className="relative">
                {pendingOrderChanges && (
                  <div className="absolute right-0 top-0 -mt-12">
                    <p className="text-xs text-amber-500 italic">Niet-opgeslagen wijzigingen</p>
                  </div>
                )}
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="radio-streams">
                    {(provided) => (
                      <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef} 
                        className="space-y-2"
                      >
                        {activeStreams.map((stream, index) => (
                          <Draggable 
                            key={stream.id} 
                            draggableId={stream.id} 
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="relative group"
                              >
                                <div className="absolute left-0 top-0 bottom-0 flex items-center pl-1 opacity-0 group-hover:opacity-50">
                                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <StreamCard 
                                  stream={stream} 
                                  onEdit={handleEdit} 
                                  onDelete={handleDelete}
                                  onToggleActive={handleToggleActive}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            ) : (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">Geen actieve streaming links gevonden</p>
                <Button variant="outline" className="mt-2" onClick={handleOpenNew}>
                  Link toevoegen
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
                <p className="text-muted-foreground">Geen inactieve streaming links gevonden</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentStream ? "Streaming Link Bewerken" : "Nieuwe Streaming Link"}
            </DialogTitle>
            <DialogDescription>
              Vul de details in voor de streaming link. De link zal in de achtergrond worden afgespeeld.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                placeholder="Naam van de streaming link"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url">Streaming Link URL</Label>
              <Input
                id="url"
                placeholder="URL naar de streaming link (bijv. https://voorbeeld.com/stream)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              {isValidUrl(url) && (
                <div className={`text-xs flex items-center mt-1 ${isValidAudioUrl(url) ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {isValidAudioUrl(url) 
                    ? "Lijkt een geldige audio stream URL" 
                    : "Geldige URL, maar mogelijk geen audio stream"}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Beschrijving (optioneel)</Label>
              <Textarea
                id="description"
                placeholder="Korte beschrijving van de streaming link"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cover-image">Afbeelding (optioneel)</Label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => document.getElementById('cover-image')?.click()}
                      className="flex items-center gap-1.5"
                    >
                      <Upload className="h-4 w-4" />
                      Afbeelding kiezen
                    </Button>
                    {imageFile && (
                      <span className="text-sm text-muted-foreground">{imageFile.name}</span>
                    )}
                  </div>
                  <Input
                    id="cover-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Aanbevolen afmeting: 400x400px</p>
                </div>
                
                {imagePreview && (
                  <div 
                    className="h-24 w-24 rounded-md bg-cover bg-center border"
                    style={{ backgroundImage: `url(${imagePreview})` }}
                  />
                )}
              </div>
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
          <div className="space-y-1 flex-1 flex items-start gap-3">
            {stream.cover_image_url ? (
              <div 
                className="h-12 w-12 rounded-md bg-cover bg-center flex-shrink-0 border"
                style={{ backgroundImage: `url(${stream.cover_image_url})` }}
              />
            ) : (
              <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0 border">
                <Radio className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            
            <div className="space-y-1">
              <div className="flex items-center">
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

