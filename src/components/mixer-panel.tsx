
import React, { useState, useRef, useEffect } from "react";
import { Volume2, Volume, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Soundscape } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

interface MixerPanelProps {
  soundscapes: Soundscape[];
  className?: string;
}

export function MixerPanel({ soundscapes, className }: MixerPanelProps) {
  const [volumes, setVolumes] = useState<{ [key: string]: number }>(
    soundscapes.reduce((acc, soundscape) => {
      acc[soundscape.id] = 0;
      return acc;
    }, {} as { [key: string]: number })
  );
  
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  
  // Initialize audio elements
  useEffect(() => {
    soundscapes.forEach((soundscape) => {
      if (!audioRefs.current[soundscape.id]) {
        const audio = new Audio(soundscape.audioUrl);
        audio.loop = true;
        audio.volume = 0;
        audioRefs.current[soundscape.id] = audio;
      }
    });
    
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
  
  // Update volumes when changed
  useEffect(() => {
    Object.entries(volumes).forEach(([id, volume]) => {
      const audio = audioRefs.current[id];
      if (audio) {
        audio.volume = volume;
        if (volume > 0 && audio.paused) {
          audio.play().catch(error => {
            console.error("Error playing audio:", error);
          });
        } else if (volume === 0 && !audio.paused) {
          audio.pause();
        }
      }
    });
  }, [volumes]);
  
  // Handle volume change
  const handleVolumeChange = (id: string, value: number[]) => {
    setVolumes((prev) => ({
      ...prev,
      [id]: value[0],
    }));
  };
  
  // Toggle mute
  const toggleMute = (id: string) => {
    setVolumes((prev) => ({
      ...prev,
      [id]: prev[id] > 0 ? 0 : 0.5,
    }));
  };
  
  return (
    <div className={cn("w-full space-y-3", className)}>
      <h3 className="text-lg font-medium">Mix Soundscapes</h3>
      
      <div className="space-y-3">
        {soundscapes.map((soundscape) => (
          <Card key={soundscape.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleMute(soundscape.id)}
                  className="p-1.5 rounded-full hover:bg-muted transition-colors"
                >
                  {volumes[soundscape.id] === 0 ? (
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  ) : volumes[soundscape.id] < 0.5 ? (
                    <Volume className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                
                <div className="flex-grow">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium truncate">
                      {soundscape.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(volumes[soundscape.id] * 100)}%
                    </span>
                  </div>
                  
                  <Slider
                    value={[volumes[soundscape.id]]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => handleVolumeChange(soundscape.id, value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
