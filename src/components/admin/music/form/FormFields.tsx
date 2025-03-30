
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TagInput } from "../TagInput";
import { AlertTriangle, ExternalLink, Image, Play, StopCircle } from "lucide-react";
import { FormFieldsProps } from "../types";

export const FormFields: React.FC<FormFieldsProps> = ({
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
  isValidatingUrl,
  isUrlValid,
  validatedUrl,
  handleAudioPreview,
}) => {
  return (
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
  );
};
