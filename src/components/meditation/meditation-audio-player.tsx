
import React from "react";
import { AudioPlayer } from "@/components/audio-player";
import { MeditationAudioPlayerProps } from "./types";
import { MeditationExternalLinks } from "./meditation-external-links";
import { QuoteDisplay } from "@/components/audio-player/quote-display";
import { getRandomQuote } from "@/components/audio-player/utils";

export const MeditationAudioPlayer: React.FC<MeditationAudioPlayerProps> = ({
  currentAudioUrl,
  selectedMeditation,
  handleAudioError,
  isPlaying,
  setIsPlaying,
  audioRef
}) => {
  const [randomQuote] = React.useState(getRandomQuote());
  
  const handlePlayExternalLink = (linkType: 'vera' | 'marco') => {
    let url = '';
    
    if (linkType === 'vera') {
      url = selectedMeditation.veraLink || '';
    } else {
      url = selectedMeditation.marcoLink || '';
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
      
      return validatedUrl;
    } catch (e) {
      console.error(`Invalid URL for ${linkType}:`, url, e);
      toast.error(`Ongeldige ${linkType === 'vera' ? 'Vera' : 'Marco'} URL: ${url}`);
      return null;
    }
  };
  
  return (
    <>
      <div className="mb-4">
        <QuoteDisplay quote={randomQuote} transparentBackground={true} />
      </div>
      
      <MeditationExternalLinks 
        selectedMeditation={selectedMeditation}
        currentAudioUrl={currentAudioUrl}
        onPlayExternalLink={(linkType) => {
          const url = handlePlayExternalLink(linkType);
          if (url) {
            // Logic for external link handling would go here
            toast.success(`${linkType === 'vera' ? 'Vera' : 'Marco'} audio wordt afgespeeld`);
          }
        }}
      />
      
      <AudioPlayer 
        audioUrl={currentAudioUrl || ''}
        title={selectedMeditation.title}
        showTitle
        showControls
        showQuote={false}
        className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg shadow-sm"
        onError={handleAudioError}
        isPlayingExternal={isPlaying}
        onPlayPauseChange={setIsPlaying}
        ref={audioRef}
      />
    </>
  );
};

import { toast } from "sonner";
