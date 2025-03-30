
import React, { useState, useRef, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  validateAudioUrl, 
  preloadAudio, 
  fixSupabaseStorageUrl, 
  completeUrlValidation 
} from "@/components/audio-player/utils";
import { FormFields } from "./form/FormFields";
import { AudioPreview } from "./form/AudioPreview";
import { ImagePreview } from "./form/ImagePreview";
import { MusicFormProps } from "./types";
import { Soundscape } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

export const MusicFormDialog: React.FC<MusicFormProps> = ({
  isOpen,
  onOpenChange,
  onSave,
  currentMusic,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [validatedUrl, setValidatedUrl] = useState("");
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [isUrlValid, setIsUrlValid] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    if (currentMusic) {
      setTitle(currentMusic.title);
      setDescription(currentMusic.description);
      setAudioUrl(currentMusic.audioUrl);
      setCoverImageUrl(currentMusic.coverImageUrl);
      setTags([...currentMusic.tags]);
      
      // Valideer de URL direct wanneer een bestaand item wordt geladen
      if (currentMusic.audioUrl) {
        validateAndSetAudioUrl(currentMusic.audioUrl);
      }
    } else {
      resetForm();
    }
  }, [currentMusic, isOpen]);
  
  useEffect(() => {
    if (audioUrl) {
      validateAndSetAudioUrl(audioUrl);
    } else {
      setValidatedUrl("");
      setIsUrlValid(true);
      setIsValidatingUrl(false);
    }
  }, [audioUrl]);
  
  const validateAndSetAudioUrl = async (url: string) => {
    setIsValidatingUrl(true);
    
    try {
      // Eerste validatie van basis-URL
      const fixedUrl = validateAudioUrl(url);
      
      // Extra validatie voor Supabase URLs
      let finalUrl = fixedUrl;
      if (fixedUrl.includes('supabase.co')) {
        finalUrl = fixSupabaseStorageUrl(fixedUrl);
      }
      
      setValidatedUrl(finalUrl);
      
      // Controleer of de URL daadwerkelijk werkt
      const success = await preloadAudio(finalUrl);
      setIsUrlValid(success);
      
      if (success) {
        console.log("Audio URL succesvol gevalideerd:", finalUrl);
      } else {
        console.warn("Audio URL validatie mislukt:", finalUrl);
        
        // Probeer extra correcties voor Supabase URLs
        if (finalUrl.includes('supabase.co')) {
          // Laatste poging met uitgebreide validatie
          const correctedUrl = await completeUrlValidation(url, true, 'soundscapes');
          if (correctedUrl) {
            setValidatedUrl(correctedUrl);
            const retrySuccess = await preloadAudio(correctedUrl);
            setIsUrlValid(retrySuccess);
            console.log("Hervalidatie resultaat:", retrySuccess ? "Succesvol" : "Mislukt", correctedUrl);
          }
        }
      }
    } catch (error) {
      console.error("Fout bij valideren audio URL:", error);
      setIsUrlValid(false);
    } finally {
      setIsValidatingUrl(false);
    }
  };
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAudioUrl("");
    setCoverImageUrl("");
    setTags([]);
    setIsPreviewPlaying(false);
    setValidatedUrl("");
    setIsUrlValid(true);
  };
  
  const handleAudioPreview = () => {
    if (audioUrl && isUrlValid) {
      setIsPreviewPlaying(!isPreviewPlaying);
    } else {
      toast.error("Voer eerst een geldige audio URL in om voor te luisteren");
    }
  };
  
  const handleAudioError = () => {
    toast.error("Kon de audio niet laden. Controleer of de URL correct is.");
    setIsPreviewPlaying(false);
    setIsUrlValid(false);
  };
  
  const processUrl = (url: string): string => {
    if (!url) return "";
    
    // Voeg http toe indien nodig
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url.replace(/^\/\//, '');
    }
    
    return url;
  };
  
  const handleSave = async () => {
    if (!title || !description || !audioUrl || !coverImageUrl) {
      toast.error("Vul alle verplichte velden in");
      return;
    }
    
    if (!isUrlValid) {
      toast.error("De audio URL is ongeldig. Controleer of de URL correct is.");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Gebruik de gevalideerde URL indien beschikbaar, anders probeer de URL te corrigeren
      const finalAudioUrl = validatedUrl || await completeUrlValidation(audioUrl, true, 'soundscapes');
      
      if (!finalAudioUrl) {
        toast.error("Kon de audio URL niet valideren. Controleer of de URL correct is.");
        setIsSaving(false);
        return;
      }
        
      const processedCoverImageUrl = processUrl(coverImageUrl);
      
      console.log("Soundscape opslaan met audioUrl:", finalAudioUrl);
      
      // First, save the data directly to Supabase if possible
      if (currentMusic) {
        // Update existing record
        const { error } = await supabase
          .from('soundscapes')
          .update({
            title: title,
            description: description,
            audio_url: finalAudioUrl,
            cover_image_url: processedCoverImageUrl,
            category: "Muziek", // Standaard categorie
            tags: tags,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentMusic.id);
          
        if (error) {
          console.error("Fout bij updaten soundscape in database:", error);
          // Continue with local save despite Supabase error
        } else {
          console.log("Soundscape succesvol bijgewerkt in Supabase");
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('soundscapes')
          .insert({
            title: title,
            description: description,
            audio_url: finalAudioUrl,
            cover_image_url: processedCoverImageUrl,
            category: "Muziek", // Standaard categorie
            tags: tags
          });
          
        if (error) {
          console.error("Fout bij opslaan soundscape in database:", error);
          // Continue with local save despite Supabase error
        } else {
          console.log("Soundscape succesvol opgeslagen in Supabase");
        }
      }
      
      // Then call the onSave callback to update local state as well
      onSave({
        title,
        description,
        audioUrl: finalAudioUrl,
        category: "Muziek", // Standaard categorie
        coverImageUrl: processedCoverImageUrl,
        tags,
      });
      
      toast.success("Muziek succesvol opgeslagen");
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Fout bij opslaan soundscape:", error);
      toast.error("Er is een fout opgetreden bij het opslaan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="space-y-1">
          <DialogTitle>
            {currentMusic ? "Soundscape Bewerken" : "Nieuwe Soundscape"}
          </DialogTitle>
          <DialogDescription>
            Vul de details in voor de soundscape
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4">
          <FormFields 
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            audioUrl={audioUrl}
            setAudioUrl={setAudioUrl}
            coverImageUrl={coverImageUrl}
            setCoverImageUrl={setCoverImageUrl}
            tags={tags}
            setTags={setTags}
            isValidatingUrl={isValidatingUrl}
            isUrlValid={isUrlValid}
            validatedUrl={validatedUrl}
            handleAudioPreview={handleAudioPreview}
            isPreviewPlaying={isPreviewPlaying}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImagePreview coverImageUrl={coverImageUrl} />
            
            <AudioPreview 
              audioUrl={audioUrl}
              isPreviewPlaying={isPreviewPlaying}
              setIsPreviewPlaying={setIsPreviewPlaying}
              isValidatingUrl={isValidatingUrl}
              isUrlValid={isUrlValid}
              validatedUrl={validatedUrl}
              audioRef={audioRef}
              handleAudioError={handleAudioError}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Annuleren
          </Button>
          <Button 
            size="sm"
            onClick={handleSave}
            disabled={!title || !description || !audioUrl || !coverImageUrl || !isUrlValid || isValidatingUrl || isSaving}
          >
            {isSaving ? (
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />
            ) : null}
            Opslaan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
