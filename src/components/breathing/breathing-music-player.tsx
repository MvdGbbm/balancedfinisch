
import React, { useState, useEffect, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { AudioPlayer } from "@/components/audio-player";
import { ToneEqualizer } from "@/components/music/tone-equalizer";
import { Soundscape } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Music, Sliders, Volume2 } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export function BreathingMusicPlayer() {
  const { soundscapes } = useApp();
  const [selectedSoundscape, setSelectedSoundscape] = useState<Soundscape | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Filter soundscapes to only include those with the "Persoonlijke Meditatie" category
  const personalMeditationMusic = soundscapes.filter(
    soundscape => soundscape.category === "Persoonlijke Meditatie"
  );

  useEffect(() => {
    // Set the first personal meditation music as default if available
    if (personalMeditationMusic.length > 0 && !selectedSoundscape) {
      setSelectedSoundscape(personalMeditationMusic[0]);
    }
  }, [personalMeditationMusic, selectedSoundscape]);

  const handleSoundscapeChange = (soundscapeId: string) => {
    const selected = personalMeditationMusic.find(s => s.id === soundscapeId);
    if (selected) {
      setSelectedSoundscape(selected);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (newValue: number[]) => {
    setMusicVolume(newValue[0]);
  };

  return (
    <div className="space-y-4 mb-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Music className="text-primary h-5 w-5" />
        <h2 className="text-lg font-medium">Persoonlijke Meditatie Muziek</h2>
      </div>

      <Card className="bg-card/60 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="space-y-4">
            <Select
              value={selectedSoundscape?.id}
              onValueChange={handleSoundscapeChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecteer meditatie muziek" />
              </SelectTrigger>
              <SelectContent>
                {personalMeditationMusic.map((soundscape) => (
                  <SelectItem key={soundscape.id} value={soundscape.id}>
                    {soundscape.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedSoundscape && (
              <div className="space-y-3">
                <div 
                  className="w-full h-40 rounded-md bg-cover bg-center"
                  style={{ backgroundImage: `url(${selectedSoundscape.coverImageUrl})` }}
                >
                  <div className="w-full h-full bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="text-center text-white p-4">
                      <h3 className="text-xl font-medium mb-1">{selectedSoundscape.title}</h3>
                      <p className="text-sm opacity-80">{selectedSoundscape.description}</p>
                    </div>
                  </div>
                </div>

                <AudioPlayer 
                  audioUrl={selectedSoundscape.audioUrl}
                  title={selectedSoundscape.title}
                  ref={audioRef}
                  isPlayingExternal={isPlaying}
                  onPlayPauseChange={setIsPlaying}
                  volume={musicVolume}
                />
                
                <div className="flex items-center space-x-2 mt-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={[musicVolume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-full"
                  />
                </div>
                
                {isPlaying && (
                  <div className="flex justify-end mt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1.5"
                        >
                          <Sliders className="h-4 w-4" />
                          Helende Frequenties
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="w-72 p-0 bg-background/95 backdrop-blur-sm border-0"
                      >
                        <ToneEqualizer
                          isActive={isPlaying}
                          audioRef={audioRef}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
