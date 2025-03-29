
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music as MusicIcon, Play, StopCircle, Volume2 } from "lucide-react";
import { Soundscape } from "@/lib/types";
import { PlaylistSelector } from "@/components/playlist/playlist-selector";
import { Playlist } from "@/components/playlist/types";

interface MusicTrackCardProps {
  track: Soundscape;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  onPreviewTrack: (track: Soundscape) => void;
  onAddToPlaylist: (track: Soundscape, playlistId: string) => void;
  onShowPlaylistCreator: () => void;
  playlists: Playlist[];
}

export const MusicTrackCard: React.FC<MusicTrackCardProps> = ({
  track,
  isPlaying,
  isCurrentTrack,
  onPreviewTrack,
  onAddToPlaylist,
  onShowPlaylistCreator,
  playlists
}) => {
  const isActive = isCurrentTrack && isPlaying;
  
  return (
    <Card 
      className={`transition-all ${
        isActive 
          ? 'ring-2 ring-primary border-primary bg-primary/5' 
          : 'bg-background/30 backdrop-blur-sm border-muted'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            isActive
              ? 'bg-primary/20' 
              : 'bg-blue-100/10 dark:bg-blue-900/20'
          }`}>
            {isActive 
              ? <Volume2 className="h-5 w-5 text-primary animate-pulse" /> 
              : <MusicIcon className="h-5 w-5 text-blue-500 dark:text-blue-300" />
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="font-medium">{track.title}</h3>
              {isActive && (
                <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary text-xs">
                  Speelt nu
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{track.description}</p>
          </div>
        </div>
        
        <div className="flex justify-between mt-3">
          <div className="flex gap-2">
            <Button 
              variant={isActive ? "destructive" : "outline"}
              size="sm" 
              onClick={() => onPreviewTrack(track)}
              className={`flex items-center gap-1 ${
                isActive
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-background/10 backdrop-blur-sm border-muted hover:bg-background/20'
              }`}
            >
              {isActive ? (
                <>
                  <StopCircle className="h-4 w-4" />
                  Stoppen
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Voorluisteren
                </>
              )}
            </Button>
          </div>
          
          <PlaylistSelector 
            playlists={playlists}
            onSelectPlaylist={(playlist) => onAddToPlaylist(track, playlist.id)}
            onCreateNew={onShowPlaylistCreator}
          />
        </div>
      </CardContent>
    </Card>
  );
}
