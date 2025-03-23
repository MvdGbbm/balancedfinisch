
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
  if (!meditation) return null;
  
  // Get the currently selected guided meditation ID
  const getCurrentGuidedMeditationId = () => {
    // If we're playing a guided meditation, we need to exclude it from the dropdown
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
                        onClick={() => {
                          onAudioSourceChange('vera');
                          onGuidedMeditationSelect(guidedMeditation);
                        }}
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
                        onClick={() => {
                          onAudioSourceChange('marco');
                          onGuidedMeditationSelect(guidedMeditation);
                        }}
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
