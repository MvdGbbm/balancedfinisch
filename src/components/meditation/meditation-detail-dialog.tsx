import React, { useState, useEffect, useRef } from "react";
import { Meditation } from "@/lib/types";
import { Soundscape } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AudioPlayer } from "@/components/audio-player";
import { MixerPanel } from "@/components/mixer-panel";
import { Button } from "@/components/ui/button";
import { Music, ExternalLink, Quote } from "lucide-react";
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
import { QuoteDisplay } from "@/components/audio-player/quote-display";
import { getRandomQuote } from "@/components/audio-player/utils";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [randomQuote] = useState(getRandomQuote());
  
  const filteredGuidedMeditations = guidedMeditations.filter(
    med => meditation && med.id !== meditation.id
  );
  
  useEffect(() => {
    if (isOpen && meditation) {
      const url = meditation.audioUrl || "";
      setAudioUrl(url);
      console.log("Active audio URL in dialog:", url);
      
      setAudioKey(prevKey => prevKey + 1);
      
      setIsPlaying(false);
    }
  }, [isOpen, meditation]);
  
  const handlePlayExternalLink = (linkType: 'vera' | 'marco') => {
    if (!meditation) return;
    
    let url = '';
    
    if (linkType === 'vera') {
      url = meditation.veraLink || '';
    } else {
      url = meditation.marcoLink || '';
    }
    
    if (!url) {
      toast.error(`Geen ${linkType === 'vera' ? 'Vera' : 'Marco'} link beschikbaar voor deze meditatie`);
      return;
    }
    
    try {
      url = url.trim();
      
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      
      const validatedUrl = new URL(url).toString();
      
      console.log(`Playing ${linkType} link:`, validatedUrl);
      
      setAudioUrl(validatedUrl);
      
      setAudioKey(prevKey => prevKey + 1);
      
      setIsPlaying(true);
      
      toast.success(`${linkType === 'vera' ? 'Vera' : 'Marco'} audio wordt afgespeeld`);
    } catch (e) {
      console.error(`Invalid URL for ${linkType}:`, url, e);
      toast.error(`Ongeldige ${linkType === 'vera' ? 'Vera' : 'Marco'} URL: ${url}`);
    }
  };
  
  if (!meditation) return null;
  
  const isValidAudioUrl = (url: string | undefined): boolean => {
    return !!url && url.trim() !== '';
  };
  
  const hasValidAudio = isValidAudioUrl(audioUrl);
  
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
          
          <div className="mb-2">
            <QuoteDisplay quote={randomQuote} transparentBackground={true} />
          </div>
          
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              className={`flex-1 ${meditation.veraLink ? (audioUrl === meditation.veraLink ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'hover:bg-blue-600 hover:text-white') : 'opacity-50 bg-transparent'}`}
              onClick={() => handlePlayExternalLink('vera')}
              disabled={!meditation.veraLink}
              type="button"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Vera
            </Button>
            
            <Button
              variant="outline"
              className={`flex-1 ${meditation.marcoLink ? (audioUrl === meditation.marcoLink ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'hover:bg-purple-600 hover:text-white') : 'opacity-50 bg-transparent'}`}
              onClick={() => handlePlayExternalLink('marco')}
              disabled={!meditation.marcoLink}
              type="button"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Marco
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {hasValidAudio ? (
              <AudioPlayer 
                key={audioKey} 
                audioUrl={audioUrl}
                className="w-full bg-transparent border-none"
                showTitle={false}
                showQuote={false}
                ref={audioRef}
                isPlayingExternal={isPlaying}
                onPlayPauseChange={setIsPlaying}
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
