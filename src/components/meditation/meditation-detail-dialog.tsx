
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
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { validateAudioUrl } from "@/components/audio-player/utils";

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
  guidedMeditations: Meditation[];
  onGuidedMeditationSelect: (meditation: Meditation) => void;
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
  getActiveAudioUrl,
  guidedMeditations,
  onGuidedMeditationSelect
}: MeditationDetailDialogProps) => {
  const { toast: useToastFn } = useToast();
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioKey, setAudioKey] = useState<number>(0); 
  
  // Move all hooks to the top level to avoid conditional hook calls
  const [showSourceNotAvailableWarning, setShowSourceNotAvailableWarning] = useState(false);
  
  // Get the currently selected guided meditation ID
  const getCurrentGuidedMeditationId = () => {
    const currentAudioUrl = getActiveAudioUrl();
    const currentGuidedMeditation = guidedMeditations.find(
      med => med.audioUrl === currentAudioUrl || 
             med.veraLink === currentAudioUrl || 
             med.marcoLink === currentAudioUrl
    );
    return currentGuidedMeditation?.id || '';
  };
  
  const currentGuidedMeditationId = getCurrentGuidedMeditationId();
  
  // Filter out the currently playing meditation from the list
  const filteredGuidedMeditations = guidedMeditations.filter(
    med => med.id !== currentGuidedMeditationId
  );
  
  useEffect(() => {
    if (isOpen && meditation) {
      // Reset warnings
      setShowSourceNotAvailableWarning(false);
      
      const url = getActiveAudioUrl();
      setAudioUrl(url);
      console.log("Active audio URL in dialog:", url);
      console.log("Selected audio source:", selectedAudioSource);
      
      // Increment the key to force AudioPlayer remount when the source changes
      setAudioKey(prevKey => prevKey + 1);
      
      // Check if Marco's link exists when Marco is selected
      if (selectedAudioSource === 'marco' && meditation && !meditation.marcoLink) {
        setShowSourceNotAvailableWarning(true);
        useToastFn({
          title: "Marco's versie niet beschikbaar",
          description: "De meditatie van Marco is niet beschikbaar. We spelen de standaard versie af.",
          variant: "destructive"
        });
      }
      
      // Check if Vera's link exists when Vera is selected
      if (selectedAudioSource === 'vera' && meditation && !meditation.veraLink && !meditation.audioUrl) {
        setShowSourceNotAvailableWarning(true);
        useToastFn({
          title: "Vera's versie niet beschikbaar",
          description: "De meditatie van Vera is niet beschikbaar.",
          variant: "destructive"
        });
      }
    }
  }, [isOpen, getActiveAudioUrl, selectedAudioSource, meditation, useToastFn]);
  
  if (!meditation) return null;
  
  // Function to check if an audio URL is valid (not empty)
  const isValidAudioUrl = (url: string | undefined): boolean => {
    return !!url && url.trim() !== '';
  };
  
  // Check if the selected source has a valid URL
  const hasValidSelectedAudio = selectedAudioSource === 'vera' 
    ? isValidAudioUrl(meditation.veraLink) || isValidAudioUrl(meditation.audioUrl)
    : isValidAudioUrl(meditation.marcoLink);
  
  const handleSelectSource = (source: 'vera' | 'marco', meditation?: Meditation) => {
    const targetMeditation = meditation || null;
    
    // Check if Marco's link exists when Marco is selected
    if (source === 'marco' && targetMeditation) {
      if (!targetMeditation.marcoLink) {
        toast("Marco's versie niet beschikbaar", {
          description: "De meditatie van Marco is niet beschikbaar. We schakelen terug naar Vera's versie."
        });
        // Default to Vera if Marco isn't available
        onAudioSourceChange('vera');
        return;
      }
    } else if (source === 'vera' && targetMeditation) {
      if (!targetMeditation.veraLink && !targetMeditation.audioUrl) {
        toast("Vera's versie niet beschikbaar", {
          description: "De meditatie van Vera is niet beschikbaar."
        });
        return;
      }
    }
    
    onAudioSourceChange(source);
    if (targetMeditation) {
      onGuidedMeditationSelect(targetMeditation);
    }
    
    // Update the audio URL immediately to reflect the change
    setTimeout(() => {
      const newUrl = getActiveAudioUrl();
      setAudioUrl(newUrl);
      setAudioKey(prevKey => prevKey + 1);
      console.log("Audio source changed to:", source, "New URL:", newUrl);
    }, 100);
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
            {/* Audio source selection buttons with dropdown menus */}
            <div className="flex gap-2 items-center justify-between mt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={selectedAudioSource === 'vera' ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex-1 rounded-full justify-between",
                      selectedAudioSource === 'vera' 
                        ? "bg-blue-500 hover:bg-blue-600 text-white" 
                        : "bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
                    )}
                    disabled={!isValidAudioUrl(meditation.veraLink) && !isValidAudioUrl(meditation.audioUrl)}
                  >
                    <div className="flex items-center">
                      <Music className="h-4 w-4 mr-2" />
                      Vera
                    </div>
                    <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-700 text-white">
                  {filteredGuidedMeditations.length > 0 ? (
                    filteredGuidedMeditations.map((guidedMeditation) => (
                      <DropdownMenuItem 
                        key={guidedMeditation.id}
                        className="hover:bg-gray-800 focus:bg-gray-800"
                        onClick={() => handleSelectSource('vera', guidedMeditation)}
                      >
                        {guidedMeditation.title}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>
                      Geen geleide meditaties beschikbaar
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
                      "flex-1 rounded-full justify-between",
                      selectedAudioSource === 'marco' 
                        ? "bg-purple-500 hover:bg-purple-600 text-white" 
                        : "bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
                    )}
                    disabled={!isValidAudioUrl(meditation.marcoLink)}
                  >
                    <div className="flex items-center">
                      <Music className="h-4 w-4 mr-2" />
                      Marco
                    </div>
                    <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-700 text-white">
                  {filteredGuidedMeditations.length > 0 ? (
                    filteredGuidedMeditations.map((guidedMeditation) => (
                      <DropdownMenuItem 
                        key={guidedMeditation.id}
                        className="hover:bg-gray-800 focus:bg-gray-800"
                        onClick={() => handleSelectSource('marco', guidedMeditation)}
                      >
                        {guidedMeditation.title}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>
                      Geen geleide meditaties beschikbaar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          
            {hasValidSelectedAudio ? (
              <AudioPlayer 
                key={audioKey} // Force remount when audio changes
                audioUrl={audioUrl}
                className="w-full bg-transparent border-none"
                showTitle={false}
                showQuote={true}
              />
            ) : (
              <div className="text-center py-4 text-gray-400 border border-gray-800 rounded-lg">
                <p>Geen audio beschikbaar voor {selectedAudioSource === 'vera' ? 'Vera' : 'Marco'}</p>
              </div>
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
