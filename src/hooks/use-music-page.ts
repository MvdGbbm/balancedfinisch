
import { useState, useEffect } from "react";
import { Soundscape } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { useToast } from "./use-toast";
import { useQuery } from "@tanstack/react-query";

export function useMusicPage() {
  const { soundscapes, setSoundscapes } = useApp();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("music");
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [musicTracks, setMusicTracks] = useState<Soundscape[]>([]);

  // Filter music tracks on initial load - only those with category "Muziek"
  useEffect(() => {
    const filteredTracks = soundscapes.filter(track => track.category === "Muziek");
    setMusicTracks(filteredTracks);
  }, [soundscapes]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleReloadPage = (
    refetchStreams: () => Promise<any>,
    isPlaying: boolean,
    isStreamPlaying: boolean,
    stopAudio: () => void,
    stopStream: () => void
  ) => {
    setIsLoading(true);
    
    if (isPlaying || isStreamPlaying) {
      stopAudio();
      stopStream();
    }
    
    refetchStreams()
      .then(() => {
        toast({
          variant: "default",
          title: "Pagina is ververst",
          description: "Alle content is opnieuw geladen"
        });
        setIsLoading(false);
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Fout bij verversen",
          description: "Er is een probleem opgetreden bij het verversen van de pagina"
        });
        setIsLoading(false);
      });
  };

  const clearAppCache = (
    isPlaying: boolean,
    isStreamPlaying: boolean,
    stopAudio: () => void,
    stopStream: () => void,
    refetchStreams: () => Promise<any>
  ) => {
    setIsLoading(true);
    
    if (isPlaying || isStreamPlaying) {
      stopAudio();
      stopStream();
    }
    
    localStorage.removeItem('processedMeditations');
    localStorage.removeItem('processedSoundscapes');
    localStorage.removeItem('soundscapes');
    localStorage.removeItem('journalEntries');
    localStorage.removeItem('quotes');
    localStorage.removeItem('plannerEvents');
    localStorage.removeItem('todayQuoteId');
    
    refetchStreams()
      .then(() => {
        toast({
          variant: "default",
          title: "Cachegeheugen gewist",
          description: "Alle opgeslagen gegevens zijn verwijderd. De app zal opnieuw worden geladen."
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Een fout bij wissen cache",
          description: "Er is een probleem opgetreden bij het wissen van het cachegeheugen"
        });
        setIsLoading(false);
      });
  };

  return {
    musicTracks,
    activeTab,
    isLoading,
    isAudioActive,
    setIsAudioActive,
    handleTabChange,
    handleReloadPage,
    clearAppCache
  };
}
