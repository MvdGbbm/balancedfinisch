
import React, { useState, useRef, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AudioPlayer } from "@/components/audio-player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Volume2, VolumeX, Play, Pause, FileAudio, Search, X, Music, Tag, Disc } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Soundscape } from "@/lib/types";
import { Equalizer } from "@/components/equalizer";
import { AudioProcessor } from "@/lib/audio-processor";
import { MixerPanel } from "@/components/mixer-panel";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const SoundscapeCard = ({ 
  soundscape, 
  isPlaying, 
  volume, 
  onTogglePlay, 
  onVolumeChange,
}: { 
  soundscape: Soundscape, 
  isPlaying: boolean, 
  volume: number,
  onTogglePlay: () => void, 
  onVolumeChange: (value: number[]) => void,
}) => {
  return (
    <Card className="overflow-hidden group hover:ring-1 hover:ring-primary/20 transition-all">
      <div className="relative h-32">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${soundscape.coverImageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-[1px] group-hover:backdrop-blur-0 transition-all" />
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
          <div>
            <h3 className="text-white font-medium">{soundscape.title}</h3>
            <div className="flex gap-1 mt-1 flex-wrap">
              <Badge variant="outline" className="bg-white/10 text-white text-[10px] h-4">
                {soundscape.category}
              </Badge>
              {soundscape.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="outline" className="bg-white/10 text-white text-[10px] h-4">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <Button
            onClick={onTogglePlay}
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 text-white" />
            ) : (
              <Play className="h-4 w-4 text-white" />
            )}
          </Button>
        </div>
      </div>
      <CardContent className="p-3 bg-gradient-to-b from-card/80 to-card">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onVolumeChange(volume > 0 ? [0] : [0.5])}
            className="p-1 rounded-full hover:bg-muted transition-colors"
          >
            {volume === 0 ? (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <Slider
            value={[volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={onVolumeChange}
            className="flex-1"
          />
        </div>
      </CardContent>
    </Card>
  );
};

const Soundscapes = () => {
  const { soundscapes } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [playingSoundscapes, setPlayingSoundscapes] = useState<Record<string, boolean>>({});
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [selectedSoundscape, setSelectedSoundscape] = useState<Soundscape | null>(null);
  const [activeTab, setActiveTab] = useState("browse");
  const [audioProcessor, setAudioProcessor] = useState<AudioProcessor | null>(null);
  
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  
  // Initialize audio elements and volumes
  useEffect(() => {
    const initialVolumes: Record<string, number> = {};
    
    soundscapes.forEach((soundscape) => {
      initialVolumes[soundscape.id] = 0;
      
      if (!audioRefs.current[soundscape.id]) {
        const audio = new Audio(soundscape.audioUrl);
        audio.loop = true;
        audio.volume = 0;
        audioRefs.current[soundscape.id] = audio;
      }
    });
    
    setVolumes(initialVolumes);
    
    // Clean up
    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      });
    };
  }, [soundscapes]);
  
  // Implement seamless looping for all audio elements
  useEffect(() => {
    const handleSeamlessLoops = () => {
      Object.entries(audioRefs.current).forEach(([id, audio]) => {
        if (!audio) return;
        
        // Only set up seamless looping for playing audio
        if (!audio.paused && audio.duration > 0) {
          // When we're 0.2 seconds away from the end, seamlessly loop
          if (audio.currentTime > audio.duration - 0.2) {
            const currentPlaybackRate = audio.playbackRate;
            audio.currentTime = 0;
            audio.playbackRate = currentPlaybackRate;
          }
        }
      });
    };
    
    // Set up interval to check audio positions
    const intervalId = setInterval(handleSeamlessLoops, 100);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Update audio elements when volumes change
  useEffect(() => {
    Object.entries(volumes).forEach(([id, volume]) => {
      const audio = audioRefs.current[id];
      if (audio) {
        audio.volume = volume;
        
        if (volume > 0 && !playingSoundscapes[id]) {
          audio.play()
            .then(() => {
              setPlayingSoundscapes((prev) => ({ ...prev, [id]: true }));
            })
            .catch((error) => {
              console.error("Error playing audio:", error);
            });
        } else if (volume === 0 && playingSoundscapes[id]) {
          audio.pause();
          setPlayingSoundscapes((prev) => ({ ...prev, [id]: false }));
        }
      }
    });
  }, [volumes, playingSoundscapes]);
  
  // Toggle play/pause
  const togglePlay = (id: string) => {
    const audio = audioRefs.current[id];
    if (!audio) return;
    
    const soundscape = soundscapes.find(s => s.id === id);
    if (!soundscape) return;
    
    if (playingSoundscapes[id]) {
      audio.pause();
      setPlayingSoundscapes((prev) => ({ ...prev, [id]: false }));
      setVolumes((prev) => ({ ...prev, [id]: 0 }));
      
      if (selectedSoundscape?.id === id) {
        setSelectedSoundscape(null);
      }
    } else {
      audio.volume = volumes[id] > 0 ? volumes[id] : 0.5;
      setVolumes((prev) => ({ ...prev, [id]: prev[id] > 0 ? prev[id] : 0.5 }));
      
      audio.play()
        .then(() => {
          setPlayingSoundscapes((prev) => ({ ...prev, [id]: true }));
          setSelectedSoundscape(soundscape);
          setActiveTab("player");
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
        });
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (id: string, value: number[]) => {
    setVolumes((prev) => ({ ...prev, [id]: value[0] }));
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };
  
  // Filter soundscapes based on search
  const filteredSoundscapes = soundscapes.filter((soundscape) => {
    return (
      soundscape.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      soundscape.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      soundscape.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      soundscape.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });
  
  // Group soundscapes by category
  const categorizedSoundscapes = filteredSoundscapes.reduce((acc, soundscape) => {
    if (!acc[soundscape.category]) {
      acc[soundscape.category] = [];
    }
    acc[soundscape.category].push(soundscape);
    return acc;
  }, {} as Record<string, Soundscape[]>);
  
  // Get all unique tags
  const allTags = Array.from(
    new Set(
      soundscapes.flatMap((soundscape) => soundscape.tags)
    )
  );
  
  // Tab change handler
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Get audio processor
  const handleGetAudioProcessor = (processor: AudioProcessor) => {
    setAudioProcessor(processor);
  };
  
  return (
    <MobileLayout>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="fixed top-[57px] left-0 right-0 z-10 bg-background/80 backdrop-blur-md border-b">
          <div className="container px-4 py-2">
            <TabsList className="w-full">
              <TabsTrigger value="browse" className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                Ontdek
              </TabsTrigger>
              <TabsTrigger value="player" className="flex-1" disabled={!selectedSoundscape}>
                <Music className="h-4 w-4 mr-2" />
                Speler
              </TabsTrigger>
              <TabsTrigger value="mixer" className="flex-1">
                <Disc className="h-4 w-4 mr-2" />
                Mixer
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <div className="pt-14 pb-20 container px-4">
          <TabsContent value="browse" className="mt-0 animate-fade-in">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Zoek soundscapes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <button 
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {searchQuery && (
                <div className="flex flex-wrap gap-1 py-2">
                  <Badge variant="outline" className="bg-primary/10">
                    Zoekresultaten voor: "{searchQuery}"
                  </Badge>
                </div>
              )}
              
              {!searchQuery && (
                <div className="flex flex-wrap gap-1 py-2 overflow-x-auto pb-2 no-scrollbar">
                  {allTags.slice(0, 8).map(tag => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => setSearchQuery(tag)}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div>
                {Object.entries(categorizedSoundscapes).map(([category, soundscapesList]) => (
                  <div key={category} className="mb-6">
                    <h2 className="text-lg font-medium mb-3 flex items-center">
                      <FileAudio className="h-4 w-4 mr-2 text-primary" />
                      {category}
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                      {soundscapesList.map((soundscape) => (
                        <SoundscapeCard
                          key={soundscape.id}
                          soundscape={soundscape}
                          isPlaying={!!playingSoundscapes[soundscape.id]}
                          volume={volumes[soundscape.id] || 0}
                          onTogglePlay={() => togglePlay(soundscape.id)}
                          onVolumeChange={(value) => handleVolumeChange(soundscape.id, value)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                
                {Object.keys(categorizedSoundscapes).length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>Geen soundscapes gevonden die aan je zoekopdracht voldoen.</p>
                    {searchQuery && (
                      <Button 
                        variant="link" 
                        onClick={clearSearch}
                      >
                        Wis zoekopdracht
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="player" className="mt-0 space-y-4 animate-fade-in">
            {selectedSoundscape ? (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-lg h-48">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${selectedSoundscape.coverImageUrl})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10 backdrop-blur-[1px]" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-xl font-bold text-white">{selectedSoundscape.title}</h2>
                    <p className="text-white/80 text-sm mt-1">{selectedSoundscape.description}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      <Badge variant="outline" className="bg-white/10 text-white">
                        {selectedSoundscape.category}
                      </Badge>
                      {selectedSoundscape.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="bg-white/10 text-white">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <AudioPlayer 
                  audioUrl={selectedSoundscape.audioUrl}
                  title={selectedSoundscape.title}
                  showTitle={false}
                  className="glass-morphism"
                  getAudioProcessor={handleGetAudioProcessor}
                />
                
                <Equalizer audioProcessor={audioProcessor} className="p-4 glass-morphism rounded-lg" />
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground">
                  Selecteer een soundscape om af te spelen
                </p>
                <Button 
                  variant="link" 
                  onClick={() => setActiveTab("browse")}
                  className="mt-2"
                >
                  Ga naar Ontdek
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="mixer" className="mt-0 animate-fade-in">
            <MixerPanel 
              soundscapes={soundscapes} 
              className="glass-morphism p-4 rounded-lg shadow-sm"
              maxDisplayed={4}
            />
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Mixer panel at the bottom (only if playing something) */}
      {Object.values(playingSoundscapes).some(Boolean) && activeTab !== "mixer" && (
        <div className="fixed bottom-16 left-0 right-0 px-4 pb-2">
          <div className="glass-morphism rounded-lg p-3 shadow-lg animate-slide-in">
            <h3 className="text-sm font-medium mb-2">Nu Spelend</h3>
            <div className="space-y-2">
              {Object.entries(playingSoundscapes)
                .filter(([_, isPlaying]) => isPlaying)
                .map(([id]) => {
                  const soundscape = soundscapes.find(s => s.id === id);
                  if (!soundscape) return null;
                  
                  return (
                    <div key={id} className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => togglePlay(id)}
                      >
                        <Pause className="h-3 w-3" />
                      </Button>
                      <div className="text-sm truncate flex-grow">{soundscape.title}</div>
                      <Slider
                        value={[volumes[id]]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={(value) => handleVolumeChange(id, value)}
                        className="w-24"
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default Soundscapes;
