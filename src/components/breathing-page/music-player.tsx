import React, { useEffect } from 'react';
import { ChevronDown, Music as MusicIcon, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AudioPlayer } from "@/components/audio-player";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MusicPlayerProps } from './types';
import { toast } from "sonner";

export const BreathingMusicPlayer: React.FC<MusicPlayerProps> = ({
  musicTracks,
  currentTrack,
  isTrackPlaying,
  musicVolume,
  onPlayTrack,
  audioPlayerRef,
  onTrackPlayPauseChange
}) => {
  useEffect(() => {
    if (currentTrack && isTrackPlaying) {
      console.log('BreathingMusicPlayer - Playing track:', currentTrack.title);
      console.log('BreathingMusicPlayer - Audio URL:', currentTrack.audioUrl);
    }
  }, [currentTrack, isTrackPlaying]);

  const handleSelectTrack = (track: any) => {
    console.log('Track selected in breathing exercise:', track);
    
    if (currentTrack?.id === track.id) {
      onTrackPlayPauseChange(!isTrackPlaying);
      
      toast.success(
        isTrackPlaying 
          ? `Muziek gepauzeerd: ${track.title}`
          : `Muziek afspelen: ${track.title}`
      );
      
      return;
    }
    
    onPlayTrack(track);
    
    toast.success(`Nieuwe muziek geselecteerd: ${track.title}`);
  };

  return (
    <>
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
                    onClick={() => handleSelectTrack(track)}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-sm bg-cover bg-center" 
                        style={{ backgroundImage: `url(${track.coverImageUrl})` }}
                      />
                      <span>{track.title}</span>
                    </div>
                    {currentTrack?.id === track.id && isTrackPlaying && (
                      <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary text-xs">
                        Speelt
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {currentTrack && (
        <div className="mt-4 p-3 border rounded-md bg-background/50">
          <div className="flex items-center mb-2">
            <Volume2 className={`h-4 w-4 text-primary mr-2 ${isTrackPlaying ? 'animate-pulse' : ''}`} />
            <h4 className="font-medium text-sm">
              {isTrackPlaying ? `Nu afspelend: ${currentTrack.title}` : `Gepauzeerd: ${currentTrack.title}`}
            </h4>
          </div>
          <AudioPlayer 
            audioUrl={currentTrack.audioUrl} 
            className="w-full"
            isPlayingExternal={isTrackPlaying}
            onPlayPauseChange={onTrackPlayPauseChange}
            volume={musicVolume}
            ref={audioPlayerRef}
          />
        </div>
      )}
    </>
  );
};
