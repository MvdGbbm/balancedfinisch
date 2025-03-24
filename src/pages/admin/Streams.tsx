
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader 
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Radio, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Type voor radiostreams
interface RadioStream {
  id: string;
  title: string;
  url: string;
  description: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const AdminStreams = () => {
  const [streams, setStreams] = useState<RadioStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStream, setCurrentStream] = useState<RadioStream | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    fetchStreams();
  }, []);
  
  // Haal streams op uit de database
  const fetchStreams = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('radio_streams')
        .select('*')
        .order('title');
      
      if (error) {
        throw error;
      }
      
      setStreams(data || []);
    } catch (error) {
      console.error("Error fetching streams:", error);
      toast.error("Kon de streams niet laden");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset formulier
  const resetForm = () => {
    setTitle("");
    setUrl("");
    setDescription("");
    setIsActive(true);
    setFormErrors({});
  };
  
  // Valideer het formulier
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!title.trim()) {
      errors.title = "Titel is verplicht";
    }
    
    if (!url.trim()) {
      errors.url = "URL is verplicht";
    } else {
      try {
        new URL(url);
      } catch (e) {
        errors.url = "Voer een geldige URL in";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Open formulier voor een nieuwe stream
  const handleOpenNew = () => {
    setCurrentStream(null);
    resetForm();
    setIsDialogOpen(true);
  };
  
  // Open formulier voor het bewerken van een stream
  const handleEdit = (stream: RadioStream) => {
    setCurrentStream(stream);
    setTitle(stream.title);
    setUrl(stream.url);
    setDescription(stream.description || "");
    setIsActive(stream.is_active);
    setIsDialogOpen(true);
  };
  
  // Sla de stream op
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      const streamData = {
        title,
        url,
        description: description || null,
        is_active: isActive
      };
      
      if (currentStream) {
        // Update bestaande stream
        const { error } = await supabase
          .from('radio_streams')
          .update(streamData)
          .eq('id', currentStream.id);
        
        if (error) throw error;
        
        toast.success("Stream bijgewerkt");
      } else {
        // Voeg nieuwe stream toe
        const { error } = await supabase
          .from('radio_streams')
          .insert([streamData]);
        
        if (error) throw error;
        
        toast.success("Nieuwe stream toegevoegd");
      }
      
      // Sluit dialoog en ververs lijst
      setIsDialogOpen(false);
      fetchStreams();
    } catch (error) {
      console.error("Error saving stream:", error);
      toast.error("Kon de stream niet opslaan");
    }
  };
  
  // Verwijder een stream
  const handleDelete = async (id: string) => {
    if (!window.confirm("Weet je zeker dat je deze stream wilt verwijderen?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('radio_streams')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Stream verwijderd");
      fetchStreams();
    } catch (error) {
      console.error("Error deleting stream:", error);
      toast.error("Kon de stream niet verwijderen");
    }
  };
  
  // Toggle de actieve status van een stream
  const handleToggleActive = async (stream: RadioStream) => {
    try {
      const { error } = await supabase
        .from('radio_streams')
        .update({ is_active: !stream.is_active })
        .eq('id', stream.id);
      
      if (error) throw error;
      
      toast.success(`Stream ${!stream.is_active ? 'geactiveerd' : 'gedeactiveerd'}`);
      fetchStreams();
    } catch (error) {
      console.error("Error toggling stream status:", error);
      toast.error("Kon de status niet wijzigen");
    }
  };
  
  // Test een stream URL
  const testStreamUrl = (url: string) => {
    window.open(url, "_blank");
  };
  
  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Radio Streams Beheren</h1>
          <Button onClick={handleOpenNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe Stream
          </Button>
        </div>
        
        <p className="text-muted-foreground">
          Beheer radiostreams die gebruikers kunnen afspelen
        </p>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : streams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {streams.map(stream => (
              <Card key={stream.id} className={!stream.is_active ? "opacity-60" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">{stream.title}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => testStreamUrl(stream.url)}
                        title="Test stream URL"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleEdit(stream)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={() => handleDelete(stream.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  {stream.description && (
                    <p className="text-sm text-muted-foreground mb-2">{stream.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">{stream.url}</p>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={stream.is_active} 
                      onCheckedChange={() => handleToggleActive(stream)}
                    />
                    <Label htmlFor={`active-${stream.id}`} className="text-sm">
                      {stream.is_active ? "Actief" : "Inactief"}
                    </Label>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border rounded-lg bg-muted/30">
            <Radio className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">Geen streams gevonden</h3>
            <p className="text-muted-foreground mb-4">
              Voeg je eerste radiostream toe
            </p>
            <Button onClick={handleOpenNew}>
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Stream
            </Button>
          </div>
        )}
      </div>
      
      {/* Formulier dialoog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentStream ? "Stream Bewerken" : "Nieuwe Stream"}
            </DialogTitle>
            <DialogDescription>
              Vul de details in voor de radiostream
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Titel <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                placeholder="Bijv. Radio 538"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={formErrors.title ? "border-destructive" : ""}
              />
              {formErrors.title && (
                <p className="text-xs text-destructive">{formErrors.title}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url">Stream URL <span className="text-destructive">*</span></Label>
              <Input
                id="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={formErrors.url ? "border-destructive" : ""}
              />
              {formErrors.url && (
                <p className="text-xs text-destructive">{formErrors.url}</p>
              )}
              <p className="text-xs text-muted-foreground">
                <ExternalLink className="h-3 w-3 inline mr-1" />
                Directe URL naar een audio stream (mp3, aac, m3u8)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                placeholder="Korte beschrijving van de stream (optioneel)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="is-active" 
                checked={isActive} 
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="is-active">Stream actief</Label>
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

export default AdminStreams;
