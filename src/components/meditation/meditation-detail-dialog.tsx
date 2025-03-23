
import React, { useState, useEffect } from "react";
import { Meditation } from "@/lib/types";
import { Soundscape } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AudioPlayer } from "@/components/audio-player";
import { MixerPanel } from "@/components/mixer-panel";
import { Button } from "@/components/ui/button";
import { Music, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

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
  const { meditations } = useApp();
  const [activeAudioUrl, setActiveAudioUrl] = useState("");
  const [guidedMeditations, setGuidedMeditations] = useState<Meditation[]>([]);
  
  // Find all guided meditations from the category "Geleide Meditaties"
  useEffect(() => {
    if (meditations) {
      const guided = meditations.filter(m => m.category === "Geleide Meditaties");
      setGuidedMeditations(guided);
    }
  }, [meditations]);
  
  // Update active audio URL when it changes
  useEffect(() => {
    if (isOpen) {
      setActiveAudioUrl(getActiveAudioUrl());
    }
  }, [isOpen, getActiveAudioUrl, selectedAudioSource]);
  
  const handleMeditationSelect = (audioUrl: string, source: 'vera' | 'marco') => {
    setActiveAudioUrl(audioUrl);
    onAudioSourceChange(source);
    toast.success(`Nieuwe meditatie geselecteerd`);
  };
  
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
            {/* Audio source selection buttons with dropdowns */}
            <div className="space-y-2">
              <div className="flex gap-2 items-center justify-between">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant={selectedAudioSource === 'vera' ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "flex-1 rounded-full",
                        selectedAudioSource === 'vera' 
                          ? "bg-blue-500 hover:bg-blue-600 text-white" 
                          : "bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
                      )}
                    >
                      <Music className="h-4 w-4 mr-2" />
                      Vera
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56 bg-gray-900 border-gray-800 text-white p-2">
                    {guidedMeditations
                      .filter(m => m.veraLink)
                      .map(m => (
                        <DropdownMenuItem 
                          key={m.id}
                          className="cursor-pointer hover:bg-gray-800 rounded px-2 py-1.5 my-0.5 text-sm"
                          onClick={() => handleMeditationSelect(m.veraLink || "", 'vera')}
                        >
                          {m.title}
                        </DropdownMenuItem>
                      ))}
                    {guidedMeditations.filter(m => m.veraLink).length === 0 && (
                      <div className="text-center p-2 text-gray-400 text-sm">
                        Geen Vera meditaties gevonden
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant={selectedAudioSource === 'marco' ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "flex-1 rounded-full",
                        selectedAudioSource === 'marco' 
                          ? "bg-purple-500 hover:bg-purple-600 text-white" 
                          : "bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
                      )}
                    >
                      <Music className="h-4 w-4 mr-2" />
                      Marco
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56 bg-gray-900 border-gray-800 text-white p-2">
                    {guidedMeditations
                      .filter(m => m.marcoLink)
                      .map(m => (
                        <DropdownMenuItem 
                          key={m.id}
                          className="cursor-pointer hover:bg-gray-800 rounded px-2 py-1.5 my-0.5 text-sm"
                          onClick={() => handleMeditationSelect(m.marcoLink || "", 'marco')}
                        >
                          {m.title}
                        </DropdownMenuItem>
                      ))}
                    {guidedMeditations.filter(m => m.marcoLink).length === 0 && (
                      <div className="text-center p-2 text-gray-400 text-sm">
                        Geen Marco meditaties gevonden
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          
            <AudioPlayer 
              audioUrl={activeAudioUrl || getActiveAudioUrl()}
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
