import React, { useState, useRef, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AudioPlayer } from "@/components/audio-player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Soundscape } from "@/lib/types";

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
    <Card className="neo-morphism overflow-hidden animate-slide-in">
      <div className="relative h-32">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${soundscape.coverImageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
          <div>
            <h3 className="text-white font-medium">{soundscape.title}</h3>
            <p className="text-white/80 text-sm">{soundscape.category}</p>
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
      <CardContent className="p-3">
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
          <span className="text-xs text-muted-foreground w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
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
    
    if (playingSoundscapes[id]) {
      audio.pause();
      setPlayingSoundscapes((prev) => ({ ...prev, [id]: false }));
      setVolumes((prev) => ({ ...prev, [id]: 0 }));
    } else {
      audio.volume = volumes[id] > 0 ? volumes[id] : 0.5;
      setVolumes((prev) => ({ ...prev, [id]: prev[id] > 0 ? prev[id] : 0.5 }));
      
      audio.play()
        .then(() => {
          setPlayingSoundscapes((prev) => ({ ...prev, [id]: true }));
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
  
  return (
    <MobileLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Soundscapes</h1>
        </div>
        
        <p className="text-muted-foreground">
          Ontspan met rustgevende natuurgeluiden en muziek
        </p>
        
        <Input
          placeholder="Zoek soundscapes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-2"
        />
        
        <div className="pb-20">
          {Object.entries(categorizedSoundscapes).map(([category, soundscapesList]) => (
            <div key={category} className="mb-6">
              <h2 className="text-lg font-medium mb-3">{category}</h2>
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
                  onClick={() => setSearchQuery("")}
                >
                  Wis zoekopdracht
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Mixer panel at the bottom (only if playing something) */}
        {Object.values(playingSoundscapes).some(Boolean) && (
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
                        <div className="text-sm truncate">{soundscape.title}</div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Soundscapes;
