
import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Soundscape } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { AudioPlayer } from "@/components/audio-player";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Music, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BreathingMusicPlayerProps {
  onVolumeChange?: (volume: number) => void;
  volume?: number;
}

export const BreathingMusicPlayer = ({ onVolumeChange, volume = 0.8 }: BreathingMusicPlayerProps) => {
  const { soundscapes, updateSoundscape } = useApp();
  const [selectedSoundscape, setSelectedSoundscape] = useState<Soundscape | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(volume);
  const [activeTab, setActiveTab] = useState("music");
  
  // Filter soundscapes to only include those with the "Muziek" category
  const musicTracks = soundscapes.filter(soundscape => soundscape.category === "Muziek");
  
  useEffect(() => {
    // Update the local volume when the parent component changes it
    if (volume !== musicVolume) {
      setMusicVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    // Notify parent component of volume changes
    if (onVolumeChange) {
      onVolumeChange(musicVolume);
    }
  }, [musicVolume, onVolumeChange]);
  
  // Set default soundscape from Muziek category if available
  useEffect(() => {
    if (!selectedSoundscape && musicTracks.length > 0) {
      setSelectedSoundscape(musicTracks[0]);
    }
  }, [musicTracks, selectedSoundscape]);
  
  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setMusicVolume(newVolume);
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    }
  };

  const handleSelectMusic = (soundscape: Soundscape) => {
    setSelectedSoundscape(soundscape);
    setIsPlaying(true);
  };
  
  const handleToggleFavorite = (soundscape: Soundscape) => {
    if (updateSoundscape) {
      const updatedSoundscape = {
        ...soundscape,
        isFavorite: !soundscape.isFavorite
      };
      
      updateSoundscape(soundscape.id, updatedSoundscape);
      
      // Update the selected soundscape if it's the one being toggled
      if (selectedSoundscape && selectedSoundscape.id === soundscape.id) {
        setSelectedSoundscape(updatedSoundscape);
      }
      
      toast.success(updatedSoundscape.isFavorite 
        ? `"${soundscape.title}" toegevoegd aan favorieten` 
        : `"${soundscape.title}" verwijderd uit favorieten`
      );
    }
  };
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="music" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-2 w-full grid grid-cols-1">
          <TabsTrigger value="music" className="flex items-center gap-1">
            <Music className="h-4 w-4" />
            <span>Muziek</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="music" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-1">Volume:</span>
              <Slider
                value={[musicVolume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-24"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
            {musicTracks.map((soundscape) => (
              <div 
                key={soundscape.id}
                className={`p-2 rounded-md cursor-pointer flex items-center gap-2 hover:bg-muted transition-colors ${selectedSoundscape?.id === soundscape.id ? 'bg-muted border-l-4 border-primary pl-1' : ''}`}
              >
                <div
                  className="flex-1 flex items-center gap-2"
                  onClick={() => handleSelectMusic(soundscape)}
                >
                  <div 
                    className="w-8 h-8 rounded-md flex-shrink-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${soundscape.coverImageUrl})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <p className="font-medium text-sm truncate">{soundscape.title}</p>
                      {soundscape.isFavorite && (
                        <Heart className="h-3 w-3 fill-red-500 text-red-500 ml-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{soundscape.category}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {selectedSoundscape?.id === soundscape.id && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary mr-2">
                      Actief
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(soundscape);
                    }}
                  >
                    <Heart 
                      className="h-4 w-4" 
                      fill={soundscape.isFavorite ? "currentColor" : "none"} 
                      color={soundscape.isFavorite ? "rgb(239 68 68)" : "currentColor"}
                    />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {selectedSoundscape && (
            <Card className="border-muted bg-background/30 backdrop-blur-sm">
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="font-medium text-sm">{selectedSoundscape.title}</div>
                  {selectedSoundscape.isFavorite && (
                    <Heart className="h-3 w-3 fill-red-500 text-red-500 ml-1" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleToggleFavorite(selectedSoundscape)}
                >
                  <Heart 
                    className="h-4 w-4" 
                    fill={selectedSoundscape.isFavorite ? "currentColor" : "none"} 
                    color={selectedSoundscape.isFavorite ? "rgb(239 68 68)" : "currentColor"}
                  />
                </Button>
              </div>
              <AudioPlayer 
                audioUrl={selectedSoundscape.audioUrl} 
                className="w-full"
                isPlayingExternal={isPlaying}
                onPlayPauseChange={setIsPlaying}
                title={selectedSoundscape.title}
                volume={musicVolume}
                showMusicSelector={false}
              />
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
