
import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music as MusicIcon, Play, Pause } from "lucide-react";
import { useApp } from "@/context/AppContext";

const Music = () => {
  const { soundscapes } = useApp();
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    if (soundscapes.length > 0) {
      // Extract unique categories
      const uniqueCategories = [...new Set(soundscapes.map(item => item.category))];
      setCategories(uniqueCategories);
      
      // Set default active category if available
      if (uniqueCategories.length > 0) {
        setActiveCategory(uniqueCategories[0]);
      }
    }
  }, [soundscapes]);

  useEffect(() => {
    // Clean up audio on component unmount
    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [audio]);

  const handlePlayTrack = (track: any) => {
    if (audio) {
      audio.pause();
    }

    const newAudio = new Audio(track.audioUrl);
    
    newAudio.addEventListener('ended', () => {
      setIsPlaying(false);
    });
    
    newAudio.addEventListener('canplaythrough', () => {
      newAudio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error("Error playing audio:", err);
        });
    });
    
    setAudio(newAudio);
    setCurrentTrack(track);
  };

  const togglePlayPause = () => {
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error("Error playing audio:", err);
        });
    }
  };

  const filteredTracks = activeCategory === "all" 
    ? soundscapes 
    : soundscapes.filter(track => track.category === activeCategory);

  return (
    <MobileLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Ontspannende Muziek</h1>
          <p className="text-muted-foreground">
            Luister naar rustgevende muziek voor meditatie en ontspanning
          </p>
        </div>

        <Tabs defaultValue={categories[0] || "all"} value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid grid-cols-2 mb-4 sm:grid-cols-4">
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeCategory} className="space-y-4">
            {filteredTracks.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {filteredTracks.map((track) => (
                  <Card 
                    key={track.id} 
                    className={`cursor-pointer transition-all ${currentTrack?.id === track.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handlePlayTrack(track)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 ${currentTrack?.id === track.id ? 'bg-primary/20' : ''}`}>
                        <MusicIcon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{track.title}</h3>
                        <p className="text-sm text-muted-foreground">{track.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Geen tracks gevonden in deze categorie</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {currentTrack && (
          <div className="fixed bottom-16 left-0 right-0 bg-background border-t p-4 flex items-center gap-3 animate-slide-up">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 rounded-full" 
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <div className="flex-1">
              <h3 className="font-medium text-sm">{currentTrack.title}</h3>
              <p className="text-xs text-muted-foreground">{currentTrack.category}</p>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Music;
