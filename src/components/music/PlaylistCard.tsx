
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListMusic, Play, StopCircle, Trash2, Volume2 } from "lucide-react";
import { Playlist } from "@/components/playlist/types";
import { Soundscape } from "@/lib/types";

interface PlaylistCardProps {
  playlist: Playlist;
  isCurrentPlaylist: boolean;
  isPlaying: boolean;
  playlistTracks: Soundscape[];
  onPlayPlaylist: () => void;
  onStopPlaylist: () => void;
  onRemoveFromPlaylist: (trackId: string) => void;
  currentTrackId?: string;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  isCurrentPlaylist,
  isPlaying,
  playlistTracks,
  onPlayPlaylist,
  onStopPlaylist,
  onRemoveFromPlaylist,
  currentTrackId
}) => {
  const trackCount = playlist.tracks.length;
  
  return (
    <Card 
      className={`transition-all ${
        isCurrentPlaylist && isPlaying
          ? 'ring-2 ring-primary border-primary bg-primary/5' 
          : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            isCurrentPlaylist && isPlaying ? 'bg-primary/20' : 'bg-primary/20'
          }`}>
            {isCurrentPlaylist && isPlaying 
              ? <Volume2 className="h-5 w-5 text-primary animate-pulse" />
              : <ListMusic className="h-5 w-5 text-primary" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <h3 className="font-medium">{playlist.name}</h3>
              {isCurrentPlaylist && isPlaying && (
                <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary text-xs">
                  Speelt nu
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {trackCount} {trackCount === 1 ? 'nummer' : 'nummers'}
            </p>
          </div>
          <div className="flex gap-2">
            {isCurrentPlaylist && isPlaying ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={onStopPlaylist}
              >
                <StopCircle className="h-4 w-4 mr-1" />
                Stoppen
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={onPlayPlaylist}
                disabled={trackCount === 0}
              >
                <Play className="h-4 w-4 mr-1" />
                Lijst afspelen
              </Button>
            )}
          </div>
        </div>
        
        {playlistTracks.length > 0 && (
          <div className="mt-3 space-y-2">
            <h4 className="text-sm font-medium">Nummers:</h4>
            <div className="pl-2 space-y-1">
              {playlistTracks.map((track, index) => (
                <div 
                  key={track.id} 
                  className={`flex items-center justify-between text-sm group py-1 px-2 rounded-md hover:bg-muted ${
                    isCurrentPlaylist && currentTrackId === track.id
                      ? 'bg-primary/10 font-medium' 
                      : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="w-5 text-muted-foreground">{index + 1}.</span>
                    <span>{track.title}</span>
                    {isCurrentPlaylist && currentTrackId === track.id && isPlaying && (
                      <Badge variant="outline" className="ml-2 text-xs border-primary/50 text-primary">
                        Speelt
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemoveFromPlaylist(track.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
