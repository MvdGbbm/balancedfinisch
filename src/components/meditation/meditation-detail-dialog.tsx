
import React from "react";
import { Meditation } from "@/lib/types";
import { Soundscape } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AudioPlayer } from "@/components/audio-player";
import { MixerPanel } from "@/components/mixer-panel";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

interface MeditationDetailDialogProps {
  meditation: Meditation | null;
  soundscapes: Soundscape[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAudioSource: 'vera' | 'marco';
  currentSoundscapeId: string | null;
  onAudioSourceChange: (source: 'vera' | 'marco') => void;
  onSoundscapeChange: (soundscapeId: string) => void;
  getActiveAudioUrl: () => string;
}

export const MeditationDetailDialog = ({
  meditation,
  soundscapes,
  isOpen,
  onOpenChange,
  selectedAudioSource,
  currentSoundscapeId,
  onAudioSourceChange,
  onSoundscapeChange,
  getActiveAudioUrl
}: MeditationDetailDialogProps) => {
  if (!meditation) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-black text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">{meditation.title}</DialogTitle>
          <DialogDescription className="text-blue-300">
            {meditation.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div 
            className="w-full h-80 bg-cover bg-center rounded-md"
            style={{ backgroundImage: `url(${meditation.coverImageUrl})`, objectFit: "cover" }}
          />
          
          <div className="grid grid-cols-1 gap-3">
            {/* Audio source selection buttons */}
            <div className="flex gap-2 items-center justify-between mt-2">
              <Button 
                variant={selectedAudioSource === 'vera' ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex-1 rounded-full",
                  selectedAudioSource === 'vera' 
                    ? "bg-blue-500 hover:bg-blue-600 text-white" 
                    : "bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
                )}
                onClick={() => onAudioSourceChange('vera')}
              >
                <Music className="h-4 w-4 mr-2" />
                Vera
              </Button>
              
              <Button 
                variant={selectedAudioSource === 'marco' ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex-1 rounded-full",
                  selectedAudioSource === 'marco' 
                    ? "bg-purple-500 hover:bg-purple-600 text-white" 
                    : "bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
                )}
                onClick={() => onAudioSourceChange('marco')}
              >
                <Music className="h-4 w-4 mr-2" />
                Marco
              </Button>
            </div>
          
            <AudioPlayer 
              audioUrl={getActiveAudioUrl()}
              className="w-full bg-transparent border-none"
              showTitle={false}
              showQuote={true}
            />
            
            <MixerPanel 
              soundscapes={soundscapes} 
              maxDisplayed={4}
              resetVolumesOnChange={true}
              externalSoundscapeId={currentSoundscapeId}
              onSoundscapeChange={onSoundscapeChange}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
