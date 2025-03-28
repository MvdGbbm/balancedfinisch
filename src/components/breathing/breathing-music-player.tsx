
import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Soundscape } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/audio-player";
import { Heart, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

interface BreathingMusicPlayerProps {
  onVolumeChange?: (volume: number) => void;
  volume?: number;
}

export const BreathingMusicPlayer = ({ onVolumeChange, volume = 0.8 }: BreathingMusicPlayerProps) => {
  const { soundscapes } = useApp();
  const [selectedSoundscape, setSelectedSoundscape] = useState<Soundscape | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(volume);
  
  // Filter soundscapes to only include those with the "Meditation" or "Relaxation" categories
  const meditationMusic = soundscapes.filter(
    soundscape => soundscape.category === "Meditatie" || 
                 soundscape.category === "Ontspanning" || 
                 soundscape.category === "Persoonlijke Meditatie"
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
  
  const handlePlaySoundscape = (soundscape: Soundscape) => {
    setSelectedSoundscape(soundscape);
    setIsPlaying(true);
    toast.success(`Nu afspelend: ${soundscape.title}`);
  };

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setMusicVolume(newVolume);
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Achtergrondmuziek</h3>
        {selectedSoundscape && (
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
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-3 max-h-[200px] overflow-y-auto pb-4">
        {meditationMusic.map((soundscape) => (
          <Card 
            key={soundscape.id} 
            className={cn(
              "overflow-hidden border-muted bg-background/30 backdrop-blur-sm",
              selectedSoundscape?.id === soundscape.id && "border-primary"
            )}
          >
            <div className="flex items-center p-3">
              <div 
                className="w-12 h-12 rounded-md bg-cover bg-center mr-3" 
                style={{ backgroundImage: `url(${soundscape.coverImageUrl})` }}
              />
              <div className="flex-1">
                <h4 className="font-medium truncate">{soundscape.title}</h4>
                <p className="text-sm text-muted-foreground truncate">{soundscape.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePlaySoundscape(soundscape)}
                >
                  {selectedSoundscape?.id === soundscape.id && isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Player */}
      {selectedSoundscape && (
        <div className="mt-2">
          <AudioPlayer 
            audioUrl={selectedSoundscape.audioUrl} 
            className="w-full"
            isPlayingExternal={isPlaying}
            onPlayPauseChange={setIsPlaying}
            title={selectedSoundscape.title}
            volume={musicVolume}
          />
        </div>
      )}
    </div>
  );
};
