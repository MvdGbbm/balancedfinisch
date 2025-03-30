
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
import { AspectRatio } from "@/components/ui/aspect-ratio";
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
  onSave: (music: Omit<Soundscape, "id">) => void;
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="title" className="text-xs">Titel</Label>
                <Input
                  id="title"
                  placeholder="Titel van de soundscape"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="description" className="text-xs">Beschrijving</Label>
                <Textarea
                  id="description"
                  placeholder="Beschrijving van de soundscape"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="tags" className="text-xs">Tags</Label>
                <TagInput tags={tags} setTags={setTags} />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="audioUrl" className="text-xs">Audio URL <span className="text-red-500">*</span></Label>
                <div className="flex gap-1">
                  <Input
                    id="audioUrl"
                    placeholder="URL naar audio bestand"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    required
                    className={`h-8 text-sm ${!isUrlValid && audioUrl ? "border-red-500" : ""}`}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-8"
                    onClick={handleAudioPreview}
                    disabled={isValidatingUrl || !isUrlValid}
                  >
                    {isValidatingUrl ? (
                      <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    ) : isPreviewPlaying ? (
                      <StopCircle className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
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
                    Kon audio niet laden. Controleer of de URL juist is.
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="coverImageUrl" className="text-xs">Cover Afbeelding URL <span className="text-red-500">*</span></Label>
                <div className="flex gap-1">
                  <Input
                    id="coverImageUrl"
                    placeholder="URL naar afbeelding"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    required
                    className="h-8 text-sm"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-8"
                  >
                    <Image className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coverImageUrl && (
              <div className="rounded-md overflow-hidden relative border">
                <AspectRatio ratio={1/1}>
                  <img 
                    src={coverImageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/400x400?text=Invalid+Image+URL";
                      toast.error("Kon de afbeelding niet laden. Controleer de URL.");
                    }}
                  />
                </AspectRatio>
              </div>
            )}
            
            {audioUrl && isPreviewPlaying && isUrlValid && (
              <div>
                <Label className="text-xs">Audio Preview</Label>
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
