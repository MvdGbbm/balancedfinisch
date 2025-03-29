
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Volume2, Music as MusicIcon, ChevronDown, Heart } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { Soundscape } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MusicPlayerProps {
  musicTracks: Soundscape[];
  currentTrack: Soundscape | null;
  isTrackPlaying: boolean;
  musicVolume: number;
  audioPlayerRef: React.RefObject<HTMLAudioElement>;
  onPlayTrack: (track: Soundscape) => void;
  onPlayPauseChange: (playing: boolean) => void;
  onToggleFavorite?: (track: Soundscape) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  musicTracks,
  currentTrack,
  isTrackPlaying,
  musicVolume,
  audioPlayerRef,
  onPlayTrack,
  onPlayPauseChange,
  onToggleFavorite
}) => {
  // Filter to only include music from "Muziek" category
  const filteredMusicTracks = musicTracks.filter(track => track.category === "Muziek");
  
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
            {filteredMusicTracks.length === 0 ? (
              <DropdownMenuItem disabled>Geen muziek gevonden</DropdownMenuItem>
            ) : (
              filteredMusicTracks.map((track) => (
                <DropdownMenuItem 
                  key={track.id} 
                  className={`flex justify-between items-center ${currentTrack?.id === track.id ? 'bg-primary/10' : ''}`}
                >
                  <div 
                    className="flex items-center gap-2 flex-1 cursor-pointer" 
                    onClick={() => onPlayTrack(track)}
                  >
                    <div 
                      className="w-6 h-6 rounded-sm bg-cover bg-center" 
                      style={{ backgroundImage: `url(${track.coverImageUrl})` }}
                    />
                    <span>{track.title}</span>
                    {track.isFavorite && (
                      <Heart className="h-3 w-3 fill-red-500 text-red-500 ml-1" />
                    )}
                  </div>
                  <div className="flex items-center">
                    {currentTrack?.id === track.id && isTrackPlaying && (
                      <Badge variant="secondary" className="mr-2 bg-primary/20 text-primary text-xs">
                        Speelt
                      </Badge>
                    )}
                    {onToggleFavorite && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(track);
                        }}
                      >
                        <Heart 
                          className="h-4 w-4" 
                          fill={track.isFavorite ? "currentColor" : "none"} 
                          color={track.isFavorite ? "rgb(239 68 68)" : "currentColor"}
                        />
                      </Button>
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Volume2 className="h-4 w-4 text-primary mr-2 animate-pulse" />
              <h4 className="font-medium text-sm">Nu afspelend: {currentTrack.title}</h4>
            </div>
            {onToggleFavorite && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => onToggleFavorite(currentTrack)}
              >
                <Heart 
                  className="h-4 w-4" 
                  fill={currentTrack.isFavorite ? "currentColor" : "none"} 
                  color={currentTrack.isFavorite ? "rgb(239 68 68)" : "currentColor"}
                />
              </Button>
            )}
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
