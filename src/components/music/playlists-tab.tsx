
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Soundscape } from "@/lib/types";
import { Playlist } from "@/components/playlist/types";
import { ListMusic, Play, StopCircle, Plus, Volume2, Trash2 } from "lucide-react";

interface PlaylistsTabProps {
  playlists: Playlist[];
  selectedPlaylist: Playlist | null;
  isPlaying: boolean;
  currentTrack: Soundscape | null;
  musicTracks: Soundscape[];
  onPlayPlaylist: (playlist: Playlist) => void;
  onStopPlaylist: () => void;
  onRemoveFromPlaylist: (trackId: string, playlistId: string) => void;
  onCreatePlaylist: () => void;
}

export const PlaylistsTab: React.FC<PlaylistsTabProps> = ({
  playlists,
  selectedPlaylist,
  isPlaying,
  currentTrack,
  musicTracks,
  onPlayPlaylist,
  onStopPlaylist,
  onRemoveFromPlaylist,
  onCreatePlaylist,
}) => {
  const getPlaylistTracks = (playlist: Playlist): Soundscape[] => {
    return playlist.tracks
      .map(track => musicTracks.find(s => s.id === track.trackId))
      .filter((track): track is Soundscape => track !== undefined);
  };

  if (playlists.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Geen afspeellijsten gevonden</p>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={onCreatePlaylist}
        >
          Maak je eerste afspeellijst
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={onCreatePlaylist}>
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe afspeellijst
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {playlists.map((playlist) => {
          const trackCount = playlist.tracks.length;
          const isCurrentPlaylist = selectedPlaylist?.id === playlist.id && isPlaying;
          
          return (
            <Card 
              key={playlist.id}
              className={`transition-all ${
                isCurrentPlaylist 
                  ? 'ring-2 ring-primary border-primary bg-primary/5' 
                  : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    isCurrentPlaylist ? 'bg-primary/20' : 'bg-primary/20'
                  }`}>
                    {isCurrentPlaylist 
                      ? <Volume2 className="h-5 w-5 text-primary animate-pulse" />
                      : <ListMusic className="h-5 w-5 text-primary" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <h3 className="font-medium">{playlist.name}</h3>
                      {isCurrentPlaylist && (
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
                    {isCurrentPlaylist ? (
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
                        onClick={() => onPlayPlaylist(playlist)}
                        disabled={trackCount === 0}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Lijst afspelen
                      </Button>
                    )}
                  </div>
                </div>
                
                {playlist.tracks.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <h4 className="text-sm font-medium">Nummers:</h4>
                    <div className="pl-2 space-y-1">
                      {getPlaylistTracks(playlist).map((track, index) => (
                        <div 
                          key={track.id} 
                          className={`flex items-center justify-between text-sm group py-1 px-2 rounded-md hover:bg-muted ${
                            isCurrentPlaylist && currentTrack?.id === track.id 
                              ? 'bg-primary/10 font-medium' 
                              : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="w-5 text-muted-foreground">{index + 1}.</span>
                            <span>{track.title}</span>
                            {isCurrentPlaylist && currentTrack?.id === track.id && (
                              <Badge variant="outline" className="ml-2 text-xs border-primary/50 text-primary">
                                Speelt
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onRemoveFromPlaylist(track.id, playlist.id)}
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
        })}
      </div>
    </>
  );
};
