
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AudioPlayer } from "@/components/audio-player";
import { Soundscape } from "@/lib/types";
import { Volume2, Music as MusicIcon, ChevronDown, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BreathingMusicSelectorProps {
  musicTracks: Soundscape[];
  currentTrack: Soundscape | null;
  isTrackPlaying: boolean;
  musicVolume: number;
  onPlayTrack: (track: Soundscape) => void;
  onPlayPauseChange: (isPlaying: boolean) => void;
  audioPlayerRef: React.RefObject<HTMLAudioElement>;
  onToggleFavorite?: (track: Soundscape) => void;
}

const BreathingMusicSelector: React.FC<BreathingMusicSelectorProps> = ({
  musicTracks,
  currentTrack,
  isTrackPlaying,
  musicVolume,
  onPlayTrack,
  onPlayPauseChange,
  audioPlayerRef,
  onToggleFavorite,
}) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Muziek op de achtergrond</h3>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full flex justify-between items-center">
            <div className="flex items-center">
              <MusicIcon className="mr-2 h-4 w-4" />
              <span>{currentTrack ? currentTrack.title : "Kies een muziekstuk"}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[240px] max-h-[300px] overflow-y-auto bg-background/95 backdrop-blur-sm border-muted z-50">
          <DropdownMenuLabel>Ontspannende Muziek</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {musicTracks.length === 0 ? (
              <DropdownMenuItem disabled>Geen muziek gevonden</DropdownMenuItem>
            ) : (
              musicTracks.map((track) => (
                <DropdownMenuItem 
                  key={track.id} 
                  className={`flex justify-between items-center ${currentTrack?.id === track.id ? 'bg-primary/10' : ''}`}
                  onClick={() => onPlayTrack(track)}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-sm bg-cover bg-center" 
                      style={{ backgroundImage: `url(${track.coverImageUrl})` }}
                    />
                    <span className="truncate max-w-[150px]">{track.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {track.isFavorite && (
                      <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 mr-1" />
                    )}
                    {currentTrack?.id === track.id && isTrackPlaying && (
                      <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary text-xs">
                        Speelt
                      </Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {currentTrack && isTrackPlaying && (
        <div className="mt-4 p-3 border rounded-md bg-background/50">
          <div className="flex items-center mb-2">
            <Volume2 className="h-4 w-4 text-primary mr-2 animate-pulse" />
            <h4 className="font-medium text-sm">Nu afspelend: {currentTrack.title}</h4>
          </div>
          <AudioPlayer 
            audioUrl={currentTrack.audioUrl} 
            className="w-full"
            isPlayingExternal={isTrackPlaying}
            onPlayPauseChange={onPlayPauseChange}
            volume={musicVolume}
            ref={audioPlayerRef}
          />
        </div>
      )}
    </div>
  );
};

export default BreathingMusicSelector;
