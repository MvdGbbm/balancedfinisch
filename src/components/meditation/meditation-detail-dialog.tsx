
import React, { useState, useEffect, useRef } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { validateAudioUrl } from "@/components/audio-player/utils";
import { ToneEqualizer } from "@/components/music/tone-equalizer";

interface MeditationDetailDialogProps {
  meditation: Meditation | null;
  soundscapes: Soundscape[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentSoundscapeId: string | null;
  onSoundscapeChange: (soundscapeId: string) => void;
  guidedMeditations: Meditation[];
  onGuidedMeditationSelect: (meditation: Meditation) => void;
}

export const MeditationDetailDialog = ({
  meditation,
  soundscapes,
  isOpen,
  onOpenChange,
  currentSoundscapeId,
  onSoundscapeChange,
  guidedMeditations,
  onGuidedMeditationSelect
}: MeditationDetailDialogProps) => {
  const { toast: useToastFn } = useToast();
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioKey, setAudioKey] = useState<number>(0); 
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [equalizerVisible, setEqualizerVisible] = useState(false);
  
  // Filter out the currently playing meditation from the list
  const filteredGuidedMeditations = guidedMeditations.filter(
    med => meditation && med.id !== meditation.id
  );
  
  useEffect(() => {
    if (isOpen && meditation) {
      const url = meditation.audioUrl || "";
      setAudioUrl(url);
      console.log("Active audio URL in dialog:", url);
      
      // Increment the key to force AudioPlayer remount when the source changes
      setAudioKey(prevKey => prevKey + 1);
    }
  }, [isOpen, meditation]);
  
  if (!meditation) return null;
  
  // Function to check if an audio URL is valid (not empty)
  const isValidAudioUrl = (url: string | undefined): boolean => {
    return !!url && url.trim() !== '';
  };
  
  // Check if there's a valid audio URL
  const hasValidAudio = isValidAudioUrl(meditation.audioUrl);
  
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
            {hasValidAudio ? (
              <AudioPlayer 
                key={audioKey} 
                audioUrl={audioUrl}
                className="w-full bg-transparent border-none"
                showTitle={false}
                showQuote={!equalizerVisible}
                ref={audioRef}
              />
            ) : (
              <div className="text-center py-4 text-gray-400 border border-gray-800 rounded-lg">
                <p>Geen audio beschikbaar voor deze meditatie</p>
              </div>
            )}
            
            {equalizerVisible && hasValidAudio && (
              <ToneEqualizer 
                isActive={true} 
                audioRef={audioRef} 
                className="mt-2 rounded-lg"
              />
            )}
            
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
