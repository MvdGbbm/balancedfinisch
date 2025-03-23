import React, { useState, useRef, useEffect } from "react";
import { Volume2, Volume, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Soundscape } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MixerPanelProps {
  soundscapes: Soundscape[];
  className?: string;
  maxDisplayed?: number;
  resetVolumesOnChange?: boolean;
}

export function MixerPanel({ 
  soundscapes, 
  className, 
  maxDisplayed = 4, 
  resetVolumesOnChange = false 
}: MixerPanelProps) {
  const [selectedSoundscapeIds, setSelectedSoundscapeIds] = useState<string[]>(
    soundscapes.slice(0, maxDisplayed).map(s => s.id)
  );
  
  const [volumes, setVolumes] = useState<{ [key: string]: number }>(
    soundscapes.reduce((acc, soundscape) => {
      acc[soundscape.id] = 0;
      return acc;
    }, {} as { [key: string]: number })
  );
  
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const [audioUrls, setAudioUrls] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [fadeIntervals, setFadeIntervals] = useState<{ [key: string]: number | null }>({});
  
  useEffect(() => {
    const fetchAudioUrls = async () => {
      try {
        setLoading(true);
        const urls: { [key: string]: string } = {};
        
        for (const soundscape of soundscapes) {
          if (soundscape.audioUrl.startsWith('http')) {
            urls[soundscape.id] = soundscape.audioUrl;
          } else {
            try {
              const { data } = await supabase.storage
                .from('meditations')
                .getPublicUrl(soundscape.audioUrl);
              
              urls[soundscape.id] = data.publicUrl;
              console.log(`Loaded audio URL for ${soundscape.title}:`, data.publicUrl);
            } catch (error) {
              console.error(`Error loading audio for ${soundscape.title}:`, error);
              toast.error(`Kon geluid niet laden voor ${soundscape.title}`);
              urls[soundscape.id] = soundscape.audioUrl;
            }
          }
        }
        
        setAudioUrls(urls);
      } catch (error) {
        console.error("Error in fetchAudioUrls:", error);
        toast.error("Er is een fout opgetreden bij het laden van geluiden");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAudioUrls();
  }, [soundscapes]);
  
  useEffect(() => {
    if (loading) return;
    
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    });
    
    audioRefs.current = {};
    
    soundscapes.forEach((soundscape) => {
      if (audioUrls[soundscape.id]) {
        const audio = new Audio(audioUrls[soundscape.id]);
        audio.loop = true;
        audio.volume = 0;
        audio.preload = "auto";
        
        audio.onerror = (e) => {
          console.error(`Error loading audio for ${soundscape.title}:`, e);
          toast.error(`Kon geluid niet laden voor ${soundscape.title}`);
        };
        
        audioRefs.current[soundscape.id] = audio;
        console.log(`Initialized audio for ${soundscape.title}`);
      } else {
        console.warn(`No URL found for soundscape: ${soundscape.title}`);
      }
    });
    
    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      });
    };
  }, [soundscapes, audioUrls, loading]);
  
  useEffect(() => {
    const handleSeamlessLoops = () => {
      Object.entries(audioRefs.current).forEach(([id, audio]) => {
        if (!audio) return;
        
        if (!audio.paused && audio.duration > 0) {
          if (audio.currentTime > audio.duration - 0.2) {
            const currentPlaybackRate = audio.playbackRate;
            audio.currentTime = 0;
            audio.playbackRate = currentPlaybackRate;
          }
        }
      });
    };
    
    const intervalId = setInterval(handleSeamlessLoops, 100);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  useEffect(() => {
    Object.entries(volumes).forEach(([id, volume]) => {
      const audio = audioRefs.current[id];
      if (audio) {
        audio.volume = volume;
        if (volume > 0 && audio.paused) {
          audio.play().catch(error => {
            console.error(`Error playing audio for soundscape ${id}:`, error);
            toast.error("Fout bij afspelen van geluid");
          });
        } else if (volume === 0 && !audio.paused) {
          audio.pause();
        }
      }
    });
  }, [volumes]);
  
  const fadeOutAudio = (soundscapeId: string) => {
    if (fadeIntervals[soundscapeId]) {
      clearInterval(fadeIntervals[soundscapeId] as number);
    }
    
    const audio = audioRefs.current[soundscapeId];
    if (!audio || audio.paused || audio.volume === 0) {
      setVolumes(prev => ({ ...prev, [soundscapeId]: 0 }));
      return;
    }
    
    const startVolume = audio.volume;
    const fadeSteps = 10;
    const fadeInterval = 50;
    let step = 0;
    
    const intervalId = window.setInterval(() => {
      step++;
      const newVolume = startVolume * (1 - step / fadeSteps);
      
      if (step >= fadeSteps || newVolume <= 0.01) {
        setVolumes(prev => ({ ...prev, [soundscapeId]: 0 }));
        clearInterval(intervalId);
        setFadeIntervals(prev => ({ ...prev, [soundscapeId]: null }));
      } else {
        setVolumes(prev => ({ ...prev, [soundscapeId]: newVolume }));
      }
    }, fadeInterval);
    
    setFadeIntervals(prev => ({ ...prev, [soundscapeId]: intervalId }));
  };
  
  const handleVolumeChange = (id: string, value: number[]) => {
    if (fadeIntervals[id]) {
      clearInterval(fadeIntervals[id] as number);
      setFadeIntervals(prev => ({ ...prev, [id]: null }));
    }
    
    setVolumes((prev) => ({
      ...prev,
      [id]: value[0],
    }));
  };
  
  const toggleMute = (id: string) => {
    setVolumes((prev) => ({
      ...prev,
      [id]: prev[id] > 0 ? 0 : 0.5,
    }));
  };
  
  const handleSoundscapeChange = (position: number, soundscapeId: string) => {
    if (resetVolumesOnChange) {
      const previousId = selectedSoundscapeIds[position];
      if (previousId && volumes[previousId] > 0) {
        fadeOutAudio(previousId);
      }
    }
    
    setSelectedSoundscapeIds(prev => {
      const newSelection = [...prev];
      newSelection[position] = soundscapeId;
      return newSelection;
    });
    
    setVolumes(prev => ({
      ...prev,
      [soundscapeId]: 0
    }));
  };
  
  useEffect(() => {
    return () => {
      Object.values(fadeIntervals).forEach(intervalId => {
        if (intervalId !== null) {
          clearInterval(intervalId);
        }
      });
    };
  }, [fadeIntervals]);
  
  if (loading) {
    return <div className="text-center p-4">Geluid laden...</div>;
  }
  
  const selectedSoundscapes = selectedSoundscapeIds
    .map(id => soundscapes.find(s => s.id === id))
    .filter(s => s !== undefined) as Soundscape[];
  
  return (
    <div className={cn("w-full space-y-3", className)}>
      <h3 className="text-lg font-medium">Mix Soundscapes</h3>
      
      <div className="space-y-4">
        {Array.from({ length: maxDisplayed }).map((_, index) => {
          const currentId = selectedSoundscapeIds[index] || "";
          const currentSoundscape = soundscapes.find(s => s.id === currentId);
          
          return (
            <div key={index} className="space-y-2">
              <Select 
                value={currentId} 
                onValueChange={(value) => handleSoundscapeChange(index, value)}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Kies een soundscape..." />
                </SelectTrigger>
                <SelectContent>
                  {soundscapes.map((soundscape) => (
                    <SelectItem key={soundscape.id} value={soundscape.id}>
                      {soundscape.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {currentSoundscape && (
                <Card className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleMute(currentSoundscape.id)}
                        className="p-1.5 rounded-full hover:bg-muted transition-colors"
                      >
                        {volumes[currentSoundscape.id] === 0 ? (
                          <VolumeX className="h-4 w-4 text-muted-foreground" />
                        ) : volumes[currentSoundscape.id] < 0.5 ? (
                          <Volume className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </button>
                      
                      <div className="flex-grow">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium truncate">
                            {currentSoundscape.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(volumes[currentSoundscape.id] * 100)}%
                          </span>
                        </div>
                        
                        <Slider
                          value={[volumes[currentSoundscape.id]]}
                          min={0}
                          max={1}
                          step={0.01}
                          onValueChange={(value) => handleVolumeChange(currentSoundscape.id, value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
