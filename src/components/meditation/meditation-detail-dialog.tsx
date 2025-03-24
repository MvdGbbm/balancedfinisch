
import React from "react";
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
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/context/AppContext";

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
  const [selectedVeraMeditationId, setSelectedVeraMeditationId] = React.useState<string | null>(null);
  const [selectedMarcoMeditationId, setSelectedMarcoMeditationId] = React.useState<string | null>(null);
  
  // Filter meditations that have vera or marco links - moved outside of conditional rendering
  const veraMeditations = meditations.filter(m => m.veraLink);
  const marcoMeditations = meditations.filter(m => m.marcoLink);
  
  // Always set up the effect regardless of whether meditation is null
  React.useEffect(() => {
    if (meditation) {
      if (meditation.veraLink) {
        setSelectedVeraMeditationId(meditation.id);
      }
      if (meditation.marcoLink) {
        setSelectedMarcoMeditationId(meditation.id);
      }
    }
  }, [meditation]);
  
  if (!meditation) return null;
  
  const handleVeraMeditationChange = (meditationId: string) => {
    setSelectedVeraMeditationId(meditationId);
    if (selectedAudioSource === 'vera') {
      onAudioSourceChange('vera');
    }
  };
  
  const handleMarcoMeditationChange = (meditationId: string) => {
    setSelectedMarcoMeditationId(meditationId);
    if (selectedAudioSource === 'marco') {
      onAudioSourceChange('marco');
    }
  };
  
  // Get the actual meditation objects
  const selectedVeraMeditation = veraMeditations.find(m => m.id === selectedVeraMeditationId) || meditation;
  const selectedMarcoMeditation = marcoMeditations.find(m => m.id === selectedMarcoMeditationId) || meditation;
  
  // Get active audio based on selected source and meditation
  const getCurrentAudioUrl = () => {
    if (selectedAudioSource === 'vera' && selectedVeraMeditation?.veraLink) {
      return selectedVeraMeditation.veraLink;
    } else if (selectedAudioSource === 'marco' && selectedMarcoMeditation?.marcoLink) {
      return selectedMarcoMeditation.marcoLink;
    }
    return meditation.audioUrl || '';
  };
  
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
            {/* Audio source selection with dropdowns */}
            <div className="space-y-2">
              <div className="flex gap-2 items-center justify-between mt-2">
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
                  <DropdownMenuContent className="bg-gray-900 border-gray-700 text-white">
                    {veraMeditations.length > 0 ? (
                      veraMeditations.map((med) => (
                        <DropdownMenuItem 
                          key={med.id}
                          className={cn(
                            "cursor-pointer hover:bg-gray-800",
                            selectedVeraMeditationId === med.id && "bg-blue-900"
                          )}
                          onClick={() => handleVeraMeditationChange(med.id)}
                        >
                          {med.title}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>
                        Geen Vera meditaties beschikbaar
                      </DropdownMenuItem>
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
                  <DropdownMenuContent className="bg-gray-900 border-gray-700 text-white">
                    {marcoMeditations.length > 0 ? (
                      marcoMeditations.map((med) => (
                        <DropdownMenuItem 
                          key={med.id}
                          className={cn(
                            "cursor-pointer hover:bg-gray-800",
                            selectedMarcoMeditationId === med.id && "bg-purple-900"
                          )}
                          onClick={() => handleMarcoMeditationChange(med.id)}
                        >
                          {med.title}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>
                        Geen Marco meditaties beschikbaar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Display active meditation title */}
              <div className="text-center text-sm text-gray-400 mt-1">
                {selectedAudioSource === 'vera' 
                  ? `Vera: ${selectedVeraMeditation.title}` 
                  : `Marco: ${selectedMarcoMeditation.title}`}
              </div>
            </div>
          
            <AudioPlayer 
              audioUrl={getCurrentAudioUrl()}
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
