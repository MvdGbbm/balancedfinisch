
import { useState, useRef } from "react";
import { useToast } from "./use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RadioStream {
  id: string;
  title: string;
  url: string;
  description?: string;
  position?: number;
  is_active: boolean;
}

export function useRadioStreams() {
  const { toast } = useToast();
  const [isStreamPlaying, setIsStreamPlaying] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");
  const [streamTitle, setStreamTitle] = useState("");
  const [hiddenIframeUrl, setHiddenIframeUrl] = useState<string | null>(null);
  const hiddenIframeRef = useRef<HTMLIFrameElement | null>(null);

  const { data: radioStreams = [], isLoading: isLoadingStreams, refetch: refetchStreams } = useQuery({
    queryKey: ['activeRadioStreams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('radio_streams')
        .select('*')
        .eq('is_active', true)
        .order('position')
        .order('title');
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
    meta: {
      onError: (error: Error) => {
        console.error("Error fetching radio streams:", error);
        toast({
          variant: "destructive",
          title: "Fout bij laden",
          description: "Kon de radiostreams niet laden."
        });
      }
    }
  });

  const handleStreamPlay = (stream: RadioStream) => {
    // Rather than trying to use the audio player, use iframe for streams
    // as they're better supported this way for radio streams
    if (stream.url) {
      // Don't use audio element for streams, use iframe instead
      setHiddenIframeUrl(stream.url);
      
      toast({
        title: "Radio link geopend",
        description: `"${stream.title}" speelt nu in de achtergrond`
      });
      
      setIsStreamPlaying(true);
      setStreamUrl(stream.url);
      setStreamTitle(stream.title);
    } else {
      toast({
        variant: "destructive",
        title: "Ongeldige URL",
        description: "De stream URL is leeg of ongeldig."
      });
    }
  };

  const handleStreamStop = () => {
    setHiddenIframeUrl(null);
    setIsStreamPlaying(false);
    setStreamUrl("");
    setStreamTitle("");
    
    toast({
      title: "Streaming gestopt",
      description: "De streaming verbinding is verbroken"
    });
  };

  return {
    radioStreams,
    isLoadingStreams,
    refetchStreams,
    isStreamPlaying,
    streamUrl,
    streamTitle,
    hiddenIframeUrl,
    hiddenIframeRef,
    
    handleStreamPlay,
    handleStreamStop
  };
}
