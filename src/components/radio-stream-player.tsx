
import React, { useState, useEffect } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Meditation } from "@/lib/types";
import { RadioStreamCategoryTabs } from "./radio/radio-stream-category-tabs";
import { MeditationPlayerContainer } from "./meditation/meditation-player-container";

interface RadioStream {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  coverImageUrl: string;
  category: string;
  tags: string[];
}

export function RadioStreamPlayer() {
  const [selectedStream, setSelectedStream] = useState<Meditation | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [streams, setStreams] = useState<RadioStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch radio streams from Supabase
  useEffect(() => {
    async function fetchStreams() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('music_items')
          .select('*')
          .eq('category', 'Radio');
        
        if (error) {
          console.error('Error fetching radio streams:', error);
          toast({
            title: "Fout bij laden",
            description: "Kon de radio streams niet laden.",
            variant: "destructive"
          });
          return;
        }
        
        console.log("Fetched radio streams:", data);
        
        // Convert to expected format
        const formattedStreams = data.map(stream => ({
          id: stream.id,
          title: stream.title,
          description: stream.description || '',
          audioUrl: stream.audio_url,
          coverImageUrl: stream.cover_image_url || '',
          category: 'Radio',
          tags: stream.tags || [],
          duration: 0 // Radio streams don't have a duration
        }));
        
        setStreams(formattedStreams);
        
        // Set first stream as default if none selected
        if (formattedStreams.length > 0 && !selectedStream) {
          setSelectedStream(formattedStreams[0] as Meditation);
        }
      } catch (error) {
        console.error('Error in fetchStreams:', error);
        toast({
          title: "Fout bij laden",
          description: "Er is een onverwachte fout opgetreden bij het laden van de streams.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchStreams();
  }, [toast]);

  // Group streams by tags for better organization
  const streamsByCategory = streams.reduce((acc, stream) => {
    // Use tags as sub-categories
    if (stream.tags && stream.tags.length > 0) {
      stream.tags.forEach(tag => {
        if (!acc[tag]) {
          acc[tag] = [];
        }
        // Check if stream is already in this tag group
        if (!acc[tag].some(s => s.id === stream.id)) {
          acc[tag].push(stream as Meditation);
        }
      });
    } else {
      // For streams without tags, add to "Overig"
      if (!acc["Overig"]) {
        acc["Overig"] = [];
      }
      if (!acc["Overig"].some(s => s.id === stream.id)) {
        acc["Overig"].push(stream as Meditation);
      }
    }
    return acc;
  }, {} as Record<string, Meditation[]>);
  
  // Get unique categories
  const categories = Object.keys(streamsByCategory);

  const handleStreamSelect = (stream: Meditation) => {
    console.log("Selected stream:", stream);
    setSelectedStream(stream);
    setIsPlayerVisible(true);
    toast({
      title: "Radio geselecteerd",
      description: `${stream.title} is geselecteerd en klaar om af te spelen.`
    });
  };

  if (isLoading) {
    return <div className="w-full text-center py-6">Laden van radio streams...</div>;
  }

  if (streams.length === 0) {
    return (
      <div className="w-full text-center py-6">
        <p>Geen radio streams gevonden. Voeg radio streams toe via Admin → Muziek.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Radio className="text-primary h-5 w-5" />
        <h2 className="text-lg font-medium">Radio Streams</h2>
      </div>
      
      <Tabs defaultValue={categories[0] || "Alle"} className="w-full">
        <RadioStreamCategoryTabs 
          categories={categories}
          streamsByCategory={streamsByCategory}
          selectedStreamId={selectedStream?.id || null}
          onSelectStream={handleStreamSelect}
        />
      </Tabs>
      
      <MeditationPlayerContainer 
        isVisible={isPlayerVisible}
        selectedMeditation={selectedStream}
        isStreamMode={true}
      />
    </div>
  );
}
