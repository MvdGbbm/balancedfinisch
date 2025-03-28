
import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Soundscape } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { AudioPlayer } from "@/components/audio-player";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Music, Play } from "lucide-react";

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
  
  // Function to handle playing a track
  const handlePlayTrack = (track: Soundscape) => {
    setSelectedSoundscape(track);
    setIsPlaying(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Ontspannende Muziek</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Volume:</span>
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
        
        <p className="text-muted-foreground">
          Luister naar rustgevende muziek voor meditatie en ontspanning
        </p>
      </div>
      
      {/* Music cards */}
      <div className="space-y-3">
        {meditationMusic
          .filter(track => track.category === "Muziek")
          .map((track) => (
            <Card 
              key={track.id} 
              className={`overflow-hidden ${
                selectedSoundscape?.id === track.id && isPlaying 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted bg-background/30 backdrop-blur-sm'
              }`}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    selectedSoundscape?.id === track.id && isPlaying
                      ? 'bg-primary/20' 
                      : 'bg-blue-100/10 dark:bg-blue-900/20'
                  }`}>
                    <Music className="h-5 w-5 text-blue-500 dark:text-blue-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{track.title}</h3>
                    <p className="text-sm text-muted-foreground">{track.description}</p>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={() => handlePlayTrack(track)}
                    className="flex items-center gap-1"
                  >
                    <Play className="h-4 w-4" />
                    {selectedSoundscape?.id === track.id && isPlaying ? 'Nu spelend' : 'Voorluisteren'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
      
      {selectedSoundscape && (
        <Card className="border-muted bg-background/30 backdrop-blur-sm mt-4">
          <AudioPlayer 
            audioUrl={selectedSoundscape.audioUrl} 
            className="w-full"
            isPlayingExternal={isPlaying}
            onPlayPauseChange={setIsPlaying}
            title={selectedSoundscape.title}
            volume={musicVolume}
            showMusicSelector={true}
            showMusicCard={false} // Don't show the card again since we have custom cards above
          />
        </Card>
      )}
    </div>
  );
};
