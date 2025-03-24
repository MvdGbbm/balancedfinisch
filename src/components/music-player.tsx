
import React, { useState, useRef, useEffect } from "react";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { MusicItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { AudioVisualizer } from "@/components/audio-visualizer";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Music, 
  ListMusic,
  Heart,
  Repeat,
  Shuffle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MusicPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  tracks: MusicItem[];
  initialTrack?: MusicItem;
  autoPlay?: boolean;
  showPlaylist?: boolean;
}

export function MusicPlayer({
  tracks,
  initialTrack,
  autoPlay = false,
  showPlaylist = true,
  className,
  ...props
}: MusicPlayerProps) {
  const [
    { 
      currentTrack, 
      isPlaying, 
      currentTime, 
      duration, 
      volume, 
      isMuted,
      formattedCurrentTime, 
      formattedDuration, 
      progress 
    },
    {
      play,
      pause,
      toggle,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      playTrack,
      setPlaylist,
      getAudioElement
    }
  ] = useAudioPlayer();
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [visualizerMode, setVisualizerMode] = useState<"equalizer" | "peaks" | "waveform">("equalizer");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  
  // Set initial playlist and track
  useEffect(() => {
    if (tracks && tracks.length > 0) {
      console.log("Setting tracks in MusicPlayer:", tracks);
      console.log("Initial track:", initialTrack);
      
      try {
        setPlaylist(tracks, initialTrack || tracks[0]);
        
        if (autoPlay) {
          setTimeout(() => {
            play();
          }, 100);
        }
      } catch (error) {
        console.error("Error initializing audio player:", error);
        toast.error("Er ging iets mis bij het laden van de muziek");
      }
    }
  }, [tracks, initialTrack, autoPlay, setPlaylist, play]);
  
  // Handle search
  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (track.category && track.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Handle seek slider change
  const handleSeekChange = (value: number[]) => {
    seek(value[0]);
  };
  
  // Handle volume slider change
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };
  
  // Get volume icon based on current volume
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="h-5 w-5" />;
    if (volume < 0.5) return <Volume1 className="h-5 w-5" />;
    return <Volume2 className="h-5 w-5" />;
  };
  
  // Cycle through visualizer modes
  const cycleVisualizerMode = () => {
    if (visualizerMode === "equalizer") setVisualizerMode("peaks");
    else if (visualizerMode === "peaks") setVisualizerMode("waveform");
    else setVisualizerMode("equalizer");
  };
  
  return (
    <div 
      className={cn("bg-card rounded-xl shadow-lg overflow-hidden flex flex-col w-full", className)} 
      {...props}
    >
      {/* Currently playing track info */}
      <div className="p-4 flex items-center gap-4 border-b">
        {currentTrack?.coverImageUrl ? (
          <img 
            src={currentTrack.coverImageUrl} 
            alt={currentTrack.title} 
            className="w-16 h-16 rounded-md object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
            <Music className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-lg truncate">{currentTrack?.title || "Geen nummer geselecteerd"}</h3>
          <p className="text-muted-foreground truncate">{currentTrack?.artist || "Selecteer een nummer om af te spelen"}</p>
        </div>
        
        <Button variant="ghost" size="icon" onClick={() => cycleVisualizerMode()}>
          <Music className="h-5 w-5" />
        </Button>
        
        {showPlaylist && (
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon">
                <ListMusic className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[70vh]">
              <div className="p-4 max-h-full overflow-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-lg">Afspeellijst</h3>
                  <Command className="w-full max-w-md rounded-lg border" onMouseEnter={() => setIsSearchOpen(true)}>
                    <CommandInput
                      placeholder="Zoek nummers..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    {isSearchOpen && (
                      <CommandList>
                        <CommandEmpty>Geen resultaten gevonden</CommandEmpty>
                        <CommandGroup>
                          {filteredTracks.map(track => (
                            <CommandItem 
                              key={track.id}
                              onSelect={() => {
                                playTrack(track);
                                setIsSearchOpen(false);
                              }}
                              className="flex items-center gap-2"
                            >
                              {track.coverImageUrl ? (
                                <img 
                                  src={track.coverImageUrl} 
                                  alt={track.title} 
                                  className="w-8 h-8 rounded object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                                  <Music className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{track.title}</p>
                                <p className="text-sm text-muted-foreground">{track.artist}</p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    )}
                  </Command>
                </div>
                
                <div className="space-y-2">
                  {tracks.map(track => (
                    <div 
                      key={track.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
                        track.id === currentTrack?.id && "bg-muted"
                      )}
                      onClick={() => playTrack(track)}
                    >
                      {track.coverImageUrl ? (
                        <img 
                          src={track.coverImageUrl} 
                          alt={track.title} 
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                          <Music className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-50 hover:opacity-100"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>
      
      {/* Visualizer */}
      <div className="p-4 bg-muted/30" onClick={cycleVisualizerMode}>
        <AudioVisualizer 
          audioElement={getAudioElement()} 
          variant={visualizerMode}
          height={120}
          className="rounded-md overflow-hidden"
        />
      </div>
      
      {/* Progress slider */}
      <div className="px-4 pt-2">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeekChange}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>{formattedCurrentTime}</span>
          <span>{formattedDuration}</span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(repeat && "text-primary")}
            onClick={() => setRepeat(!repeat)}
          >
            <Repeat className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(shuffle && "text-primary")}
            onClick={() => setShuffle(!shuffle)}
          >
            <Shuffle className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={previous}>
            <SkipBack className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="default" 
            size="icon" 
            className="h-12 w-12 rounded-full"
            onClick={toggle}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </Button>
          
          <Button variant="ghost" size="icon" onClick={next}>
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleMute}>
            {getVolumeIcon()}
          </Button>
          
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
}
