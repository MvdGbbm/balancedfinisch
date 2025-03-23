import React, { useState, useRef, useEffect } from "react";
import { Volume2, Volume, VolumeX, ChevronDown, Save, Download, Disc } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Soundscape } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { supabase, getPublicUrl } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface SavedMix {
  id: number;
  name: string;
  soundscapes: {
    id: string;
    volume: number;
  }[];
  masterVolume?: number;
}

interface MixerPanelProps {
  soundscapes: Soundscape[];
  className?: string;
  maxDisplayed?: number;
  resetVolumesOnChange?: boolean;
  externalSoundscapeId?: string;
  onSoundscapeChange?: (soundscapeId: string) => void;
  compactMode?: boolean;
}

export function MixerPanel({ 
  soundscapes, 
  className, 
  maxDisplayed = 4, 
  resetVolumesOnChange = false,
  externalSoundscapeId,
  onSoundscapeChange,
  compactMode = false
}: MixerPanelProps) {
  const [selectedSoundscapeIds, setSelectedSoundscapeIds] = useState<string[]>(
    externalSoundscapeId 
      ? [externalSoundscapeId, ...soundscapes.slice(0, maxDisplayed - 1).map(s => s.id)]
      : soundscapes.slice(0, maxDisplayed).map(s => s.id)
  );
  
  const [volumes, setVolumes] = useState<{ [key: string]: number }>(
    soundscapes.reduce((acc, soundscape) => {
      acc[soundscape.id] = 0;
      return acc;
    }, {} as { [key: string]: number })
  );
  
  const [masterVolume, setMasterVolume] = useState<number>(1);
  
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const [audioUrls, setAudioUrls] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [fadeIntervals, setFadeIntervals] = useState<{ [key: string]: number | null }>({});
  const [isOpen, setIsOpen] = useState(!compactMode);
  const [savedMixes, setSavedMixes] = useState<SavedMix[]>([
    { id: 1, name: "Slot 1", soundscapes: [] },
    { id: 2, name: "Slot 2", soundscapes: [] },
    { id: 3, name: "Slot 3", soundscapes: [] }
  ]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  
  useEffect(() => {
    if (externalSoundscapeId && !selectedSoundscapeIds.includes(externalSoundscapeId)) {
      setSelectedSoundscapeIds(prev => {
        const newSelection = [...prev];
        newSelection[0] = externalSoundscapeId;
        return newSelection;
      });
    }
  }, [externalSoundscapeId, selectedSoundscapeIds]);
  
  useEffect(() => {
    const savedMixesData = localStorage.getItem('savedSoundscapeMixes');
    if (savedMixesData) {
      try {
        const parsedMixes = JSON.parse(savedMixesData);
        setSavedMixes(parsedMixes);
        console.log("Loaded saved mixes from localStorage:", parsedMixes);
      } catch (e) {
        console.error("Error parsing saved mixes:", e);
      }
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('savedSoundscapeMixes', JSON.stringify(savedMixes));
    console.log("Saved mixes to localStorage:", savedMixes);
  }, [savedMixes]);

  const saveMixToSlot = (slotId: number) => {
    const activeSoundscapes = Object.entries(volumes)
      .filter(([_, volume]) => volume > 0)
      .map(([id, volume]) => ({
        id,
        volume
      }));
    
    selectedSoundscapeIds.forEach(id => {
      if (!activeSoundscapes.some(s => s.id === id)) {
        activeSoundscapes.push({
          id,
          volume: volumes[id]
        });
      }
    });
    
    if (activeSoundscapes.length === 0) {
      toast.error("Geen actieve geluiden om op te slaan");
      return;
    }
    
    setSavedMixes(prev => 
      prev.map(mix => 
        mix.id === slotId 
          ? { ...mix, soundscapes: activeSoundscapes, masterVolume } 
          : mix
      )
    );
    
    setActiveSlot(slotId);
    toast.success(`Mix opgeslagen in ${slotId === 1 ? 'eerste' : slotId === 2 ? 'tweede' : 'derde'} slot`);
  };
  
  const loadMix = (slotId: number) => {
    const mixToLoad = savedMixes.find(mix => mix.id === slotId);
    
    if (!mixToLoad || mixToLoad.soundscapes.length === 0) {
      toast.error("Geen opgeslagen mix gevonden in dit slot");
      return;
    }
    
    Object.keys(volumes).forEach(id => {
      if (volumes[id] > 0) {
        fadeOutAudio(id, true);
      }
    });
    
    if (mixToLoad.masterVolume !== undefined) {
      setMasterVolume(mixToLoad.masterVolume);
    }
    
    const newSelectedIds = [...Array(maxDisplayed)].map((_, i) => {
      if (i < mixToLoad.soundscapes.length) {
        const savedSound = mixToLoad.soundscapes[i];
        if (soundscapes.some(s => s.id === savedSound.id)) {
          return savedSound.id;
        }
      }
      return selectedSoundscapeIds[i] || soundscapes[i]?.id || "";
    });
    
    setSelectedSoundscapeIds(newSelectedIds);
    
    const newVolumes = { ...volumes };
    Object.keys(newVolumes).forEach(id => {
      newVolumes[id] = 0;
    });
    
    mixToLoad.soundscapes.forEach(savedSound => {
      if (soundscapes.some(s => s.id === savedSound.id)) {
        newVolumes[savedSound.id] = savedSound.volume;
      }
    });
    
    console.log("Loading mix:", mixToLoad);
    console.log("New volumes:", newVolumes);
    console.log("New selected IDs:", newSelectedIds);
    
    setVolumes(newVolumes);
    setActiveSlot(slotId);
    toast.success(`Mix geladen uit ${slotId === 1 ? 'eerste' : slotId === 2 ? 'tweede' : 'derde'} slot`);
  };
  
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
              const publicUrl = getPublicUrl('meditations', soundscape.audioUrl);
              if (publicUrl) {
                urls[soundscape.id] = publicUrl;
                console.log(`Loaded audio URL for ${soundscape.title}:`, publicUrl);
              } else {
                console.error(`Failed to get public URL for ${soundscape.title}`);
                toast.error(`Kon geluid niet laden voor ${soundscape.title}`);
              }
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
        audio.volume = volume * masterVolume;
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
  }, [volumes, masterVolume]);
  
  const fadeOutAudio = (soundscapeId: string, quick = false) => {
    if (fadeIntervals[soundscapeId]) {
      clearInterval(fadeIntervals[soundscapeId] as number);
    }
    
    const audio = audioRefs.current[soundscapeId];
    if (!audio || audio.paused || audio.volume === 0) {
      setVolumes(prev => ({ ...prev, [soundscapeId]: 0 }));
      return;
    }
    
    const startVolume = audio.volume;
    const fadeSteps = quick ? 3 : 10;
    const fadeInterval = quick ? 30 : 50;
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

    if (position === 0 && onSoundscapeChange) {
      onSoundscapeChange(soundscapeId);
    }
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
  
  const handleMasterVolumeChange = (value: number[]) => {
    setMasterVolume(value[0]);
  };
  
  if (loading) {
    return <div className="text-center p-4">Geluid laden...</div>;
  }
  
  const getAvailableSoundscapes = (currentPosition: number) => {
    return soundscapes.filter(soundscape => 
      !selectedSoundscapeIds.includes(soundscape.id) || 
      selectedSoundscapeIds[currentPosition] === soundscape.id
    );
  };
  
  const selectedSoundscapes = selectedSoundscapeIds
    .map(id => soundscapes.find(s => s.id === id))
    .filter(s => s !== undefined) as Soundscape[];
    
  if (compactMode) {
    const currentId = selectedSoundscapeIds[0] || "";
    const currentSoundscape = soundscapes.find(s => s.id === currentId);
    
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center space-x-3 bg-card dark:bg-card rounded-lg p-3 border">
          <Select 
            value={currentId} 
            onValueChange={(value) => handleSoundscapeChange(0, value)}
          >
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Kies een soundscape..." />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border">
              {soundscapes.map((soundscape) => (
                <SelectItem key={soundscape.id} value={soundscape.id}>
                  {soundscape.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {currentSoundscape && (
            <div className="flex-grow flex items-center space-x-3">
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
                <Slider
                  value={[volumes[currentSoundscape.id]]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => handleVolumeChange(currentSoundscape.id, value)}
                  className="w-full"
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">
                {Math.round(volumes[currentSoundscape.id] * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("w-full space-y-2", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg p-3 bg-card shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Disc className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-medium">Mix Soundscapes</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-md">
              <Volume2 className="h-3.5 w-3.5 text-primary" />
              <Slider
                value={[masterVolume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleMasterVolumeChange}
                className="w-20"
              />
              <span className="text-xs text-muted-foreground min-w-8">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>
            
            <CollapsibleTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? '' : 'transform rotate-180'}`} />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        
        <CollapsibleContent className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Opslaan</p>
              <div className="flex gap-1 flex-wrap">
                {savedMixes.map((mix) => (
                  <Button
                    key={`save-${mix.id}`}
                    size="sm"
                    variant={activeSlot === mix.id ? "secondary" : "outline"}
                    className="h-8 text-xs w-full flex items-center gap-1"
                    onClick={() => saveMixToSlot(mix.id)}
                  >
                    <Save className="h-3 w-3" />
                    <span>Bewaren {mix.id}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Laden</p>
              <div className="flex gap-1 flex-wrap">
                {savedMixes.map((mix) => (
                  <Button
                    key={`load-${mix.id}`}
                    size="sm"
                    variant={activeSlot === mix.id ? "default" : "outline"}
                    className="h-8 text-xs w-full flex items-center gap-1"
                    onClick={() => loadMix(mix.id)}
                  >
                    <Download className="h-3 w-3" />
                    <span>Oproepen {mix.id}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {Array.from({ length: maxDisplayed }).map((_, index) => {
            const currentId = selectedSoundscapeIds[index] || "";
            const currentSoundscape = soundscapes.find(s => s.id === currentId);
            const availableSoundscapes = getAvailableSoundscapes(index);
            
            return (
              <div key={index} className="space-y-2">
                <Select 
                  value={currentId} 
                  onValueChange={(value) => handleSoundscapeChange(index, value)}
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Kies een soundscape..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    {availableSoundscapes.map((soundscape) => (
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
