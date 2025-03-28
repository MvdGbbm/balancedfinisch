
import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Soundscape } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { AudioPlayer } from "@/components/audio-player";
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
                 soundscape.category === "Persoonlijke Meditatie" ||
                 soundscape.category === "Muziek"
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
    if (!selectedSoundscape && meditationMusic.length > 0) {
      const musicTracks = meditationMusic.filter(track => track.category === "Muziek");
      if (musicTracks.length > 0) {
        setSelectedSoundscape(musicTracks[0]);
      } else {
        setSelectedSoundscape(meditationMusic[0]);
      }
    }
  }, [meditationMusic, selectedSoundscape]);
  
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
      
      {selectedSoundscape && (
        <Card className="border-muted bg-background/30 backdrop-blur-sm">
          <AudioPlayer 
            audioUrl={selectedSoundscape.audioUrl} 
            className="w-full"
            isPlayingExternal={isPlaying}
            onPlayPauseChange={setIsPlaying}
            title={selectedSoundscape.title}
            volume={musicVolume}
            showMusicSelector={true}
          />
        </Card>
      )}
    </div>
  );
};
