
import React from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormFields } from "./form/FormFields";
import { AudioPreview } from "./form/AudioPreview";
import { ImagePreview } from "./form/ImagePreview";
import { MusicFormProps } from "./types";
import { useMusicForm } from "./hooks/useMusicForm";

export const MusicFormDialog: React.FC<MusicFormProps> = ({
  isOpen,
  onOpenChange,
  onSave,
  currentMusic,
}) => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    audioUrl,
    setAudioUrl,
    coverImageUrl,
    setCoverImageUrl,
    tags,
    setTags,
    isPreviewPlaying,
    setIsPreviewPlaying,
    validatedUrl,
    isValidatingUrl,
    isUrlValid,
    isSaving,
    audioRef,
    handleAudioPreview,
    handleAudioError,
    handleSave
  } = useMusicForm(currentMusic, onSave, onOpenChange, isOpen);

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
