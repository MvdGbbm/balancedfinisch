
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileAudio, Image, Play, StopCircle, ExternalLink, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { AudioPlayer } from "@/components/audio-player";
import { ToneEqualizer } from "@/components/music/tone-equalizer";
import { TagInput } from "./TagInput";
import { Soundscape } from "@/lib/types";
import { validateAudioUrl, preloadAudio, fixSupabaseStorageUrl, getAudioMimeType } from "@/components/audio-player/utils";

interface MusicFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (music: Partial<Soundscape>) => void;
  currentMusic: Soundscape | null;
}

export const MusicFormDialog: React.FC<MusicFormDialogProps> = ({
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
  
  // Validate and update URL when it changes
  useEffect(() => {
    if (audioUrl) {
      setIsValidatingUrl(true);
      
      const fixedUrl = validateAudioUrl(audioUrl);
      if (!fixedUrl) {
        setIsUrlValid(false);
        setIsValidatingUrl(false);
        return;
      }
      
      const supabaseUrl = fixedUrl.includes('supabase.co') ? fixSupabaseStorageUrl(fixedUrl) : fixedUrl;
      
      setValidatedUrl(supabaseUrl);
      
      // Check if the URL is valid
      preloadAudio(supabaseUrl).then((success) => {
        setIsUrlValid(success);
        setIsValidatingUrl(false);
        
        if (success) {
          console.log("Audio URL validated successfully:", supabaseUrl);
        } else {
          console.warn("Audio URL validation failed:", supabaseUrl);
        }
      }).catch(() => {
        setIsUrlValid(false);
        setIsValidatingUrl(false);
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
    
    // Validate URLs before saving
    const processedAudioUrl = validateAudioUrl(audioUrl);
    const finalAudioUrl = processedAudioUrl.includes('supabase.co') 
      ? fixSupabaseStorageUrl(processedAudioUrl) 
      : processedAudioUrl;
      
    let processedCoverImageUrl = coverImageUrl;
    
    // Basic validation for image URL
    if (!coverImageUrl.startsWith('http://') && !coverImageUrl.startsWith('https://')) {
      processedCoverImageUrl = 'https://' + coverImageUrl.replace(/^\/\//, '');
    }
    
    console.log("Saving music with audioUrl:", finalAudioUrl);
    
    onSave({
      title,
      description,
      audioUrl: finalAudioUrl,
      category: "Muziek",
      coverImageUrl: processedCoverImageUrl,
      tags,
    });
    
    toast.success("Muziek succesvol opgeslagen");
    onOpenChange(false);
    resetForm();
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {currentMusic ? "Muziek Bewerken" : "Nieuwe Muziek"}
          </DialogTitle>
          <DialogDescription>
            Vul de details in voor de muziek
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                placeholder="Titel van de muziek"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                placeholder="Beschrijving van de muziek"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <TagInput tags={tags} setTags={setTags} />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="audioUrl">Audio URL <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Input
                  id="audioUrl"
                  placeholder="URL naar audio bestand"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  required
                  className={!isUrlValid && audioUrl ? "border-red-500" : ""}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  className="shrink-0"
                  onClick={handleAudioPreview}
                  disabled={isValidatingUrl || !isUrlValid}
                >
                  {isValidatingUrl ? (
                    <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : isPreviewPlaying ? (
                    <StopCircle className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {validatedUrl && validatedUrl !== audioUrl && (
                <div className="text-xs text-amber-500 flex items-center mt-1">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  URL wordt aangepast naar: {validatedUrl}
                </div>
              )}
              {!isUrlValid && audioUrl && (
                <div className="text-xs text-red-500 flex items-center mt-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Kon audio niet laden. Controleer of de URL juist is en toegankelijk.
                </div>
              )}
              {isValidUrl(audioUrl) && (
                <div className="text-xs text-muted-foreground flex items-center mt-1">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Directe URL naar een online audio bestand
                </div>
              )}
              {audioUrl && audioUrl.includes('supabase.co') && (
                <div className="text-xs text-blue-500 flex items-center mt-1">
                  <FileAudio className="h-3 w-3 mr-1" />
                  Supabase Storage URL gedetecteerd
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="coverImageUrl">Cover Afbeelding URL <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Input
                  id="coverImageUrl"
                  placeholder="URL naar afbeelding"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  required
                />
                <Button 
                  type="button" 
                  variant="outline"
                  className="shrink-0"
                >
                  <Image className="h-4 w-4" />
                </Button>
              </div>
              {isValidUrl(coverImageUrl) && (
                <div className="text-xs text-muted-foreground flex items-center mt-1">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Directe URL naar een online afbeelding
                </div>
              )}
            </div>
            
            {coverImageUrl && (
              <div className="mt-4 aspect-video bg-cover bg-center rounded-md overflow-hidden relative">
                <img 
                  src={coverImageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/400x225?text=Invalid+Image+URL";
                    toast.error("Kon de afbeelding niet laden. Controleer de URL.");
                  }}
                />
              </div>
            )}
            
            {audioUrl && isPreviewPlaying && isUrlValid && (
              <div className="mt-4">
                <Label>Audio Preview</Label>
                <ToneEqualizer isActive={isPreviewPlaying} className="mb-2" audioRef={audioRef} />
                <AudioPlayer 
                  audioUrl={validatedUrl || audioUrl} 
                  isPlayingExternal={isPreviewPlaying}
                  onPlayPauseChange={setIsPreviewPlaying}
                  onError={handleAudioError}
                  ref={audioRef}
                />
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuleren
          </Button>
          <Button 
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
