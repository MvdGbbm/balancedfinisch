
import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Soundscape } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { AudioPlayer } from "@/components/audio-player";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Music } from "lucide-react";

interface BreathingMusicPlayerProps {
  onVolumeChange?: (volume: number) => void;
  volume?: number;
}

export const BreathingMusicPlayer = ({ onVolumeChange, volume = 0.8 }: BreathingMusicPlayerProps) => {
  const { soundscapes } = useApp();
  const [selectedSoundscape, setSelectedSoundscape] = useState<Soundscape | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(volume);
  const [activeTab, setActiveTab] = useState("music");
  
  // Filter soundscapes to only include those with the "Muziek" category
  const musicTracks = soundscapes.filter(
    soundscape => soundscape.category === "Muziek"
  );
  
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
                onClick={() => handleSelectMusic(soundscape)}
              >
                <div 
                  className="w-8 h-8 rounded-md flex-shrink-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${soundscape.coverImageUrl})` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{soundscape.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{soundscape.category}</p>
                </div>
                {selectedSoundscape?.id === soundscape.id && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    Actief
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {selectedSoundscape && (
            <Card className="border-muted bg-background/30 backdrop-blur-sm">
              <AudioPlayer 
                audioUrl={selectedSoundscape.audioUrl} 
                className="w-full"
                isPlayingExternal={isPlaying}
                onPlayPauseChange={setIsPlaying}
                title={selectedSoundscape.title}
                volume={musicVolume}
                showMusicSelector={false}
                showQuote={true}
              />
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
