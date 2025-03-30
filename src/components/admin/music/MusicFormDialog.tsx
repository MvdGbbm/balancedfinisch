
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
import { validateAudioUrl, preloadAudio, fixSupabaseStorageUrl } from "@/components/audio-player/utils";
import { FormFields } from "./form/FormFields";
import { AudioPreview } from "./form/AudioPreview";
import { ImagePreview } from "./form/ImagePreview";
import { MusicFormProps } from "./types";
import { Soundscape } from "@/lib/types";

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
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    if (currentMusic) {
      setTitle(currentMusic.title);
      setDescription(currentMusic.description);
      setAudioUrl(currentMusic.audioUrl);
      setCoverImageUrl(currentMusic.coverImageUrl);
      setTags([...currentMusic.tags]);
    } else {
      resetForm();
    }
  }, [currentMusic, isOpen]);
  
  useEffect(() => {
    if (audioUrl) {
      setIsValidatingUrl(true);
      
      const fixedUrl = validateAudioUrl(audioUrl);
      const supabaseUrl = fixedUrl.includes('supabase.co') ? fixSupabaseStorageUrl(fixedUrl) : fixedUrl;
      
      setValidatedUrl(supabaseUrl);
      
      preloadAudio(supabaseUrl).then(success => {
        setIsUrlValid(success);
        setIsValidatingUrl(false);
        
        if (success) {
          console.log("Audio URL validated successfully:", supabaseUrl);
        } else {
          console.warn("Audio URL validation failed:", supabaseUrl);
        }
      });
    } else {
      setValidatedUrl("");
      setIsUrlValid(true);
      setIsValidatingUrl(false);
    }
  }, [audioUrl]);
  
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
    if (audioUrl) {
      setIsPreviewPlaying(!isPreviewPlaying);
    } else {
      toast.error("Voer eerst een audio URL in om voor te luisteren");
    }
  };
  
  const handleAudioError = () => {
    toast.error("Kon de audio niet laden. Controleer of de URL correct is.");
    setIsPreviewPlaying(false);
  };
  
  const handleSave = () => {
    if (!title || !description || !audioUrl || !coverImageUrl) {
      toast.error("Vul alle verplichte velden in");
      return;
    }
    
    const processedAudioUrl = validateAudioUrl(audioUrl);
    const finalAudioUrl = processedAudioUrl.includes('supabase.co') 
      ? fixSupabaseStorageUrl(processedAudioUrl) 
      : processedAudioUrl;
      
    let processedCoverImageUrl = coverImageUrl;
    
    if (!coverImageUrl.startsWith('http://') && !coverImageUrl.startsWith('https://')) {
      processedCoverImageUrl = 'https://' + coverImageUrl.replace(/^\/\//, '');
    }
    
    console.log("Saving music with audioUrl:", finalAudioUrl);
    
    onSave({
      title,
      description,
      audioUrl: finalAudioUrl,
      category: "Muziek", // Default category
      coverImageUrl: processedCoverImageUrl,
      tags,
    });
    
    toast.success("Muziek succesvol opgeslagen");
    onOpenChange(false);
    resetForm();
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
            disabled={!title || !description || !audioUrl || !coverImageUrl || !isUrlValid}
          >
            Opslaan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
