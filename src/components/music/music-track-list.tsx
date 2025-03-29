
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MusicIcon, Play, StopCircle, Volume2 } from "lucide-react";
import { Soundscape } from "@/lib/types";
import { PlaylistSelector } from "@/components/playlist/playlist-selector";
import { Playlist } from "@/components/playlist/types";

interface MusicTrackListProps {
  musicTracks: Soundscape[];
  previewTrack: Soundscape | null;
  currentTrack: Soundscape | null;
  isPlaying: boolean;
  onPreviewTrack: (track: Soundscape) => void;
  playlists: Playlist[];
  onAddToPlaylist: (track: Soundscape, playlist: Playlist) => void;
  onCreatePlaylist: () => void;
}

export const MusicTrackList: React.FC<MusicTrackListProps> = ({
  musicTracks,
  previewTrack,
  currentTrack,
  isPlaying,
  onPreviewTrack,
  playlists,
  onAddToPlaylist,
  onCreatePlaylist,
}) => {
  if (musicTracks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Geen muziek tracks gevonden</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {musicTracks.map((track) => (
        <Card 
          key={track.id} 
          className={`transition-all ${
            (currentTrack?.id === track.id || previewTrack?.id === track.id) && isPlaying 
              ? 'ring-2 ring-primary border-primary bg-primary/5' 
              : 'bg-background/30 backdrop-blur-sm border-muted'
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                (previewTrack?.id === track.id || currentTrack?.id === track.id) && isPlaying
                  ? 'bg-primary/20' 
                  : 'bg-blue-100/10 dark:bg-blue-900/20'
              }`}>
                {(previewTrack?.id === track.id || currentTrack?.id === track.id) && isPlaying 
                  ? <Volume2 className="h-5 w-5 text-primary animate-pulse" /> 
                  : <MusicIcon className="h-5 w-5 text-blue-500 dark:text-blue-300" />
                }
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="font-medium">{track.title}</h3>
                  {(previewTrack?.id === track.id || currentTrack?.id === track.id) && isPlaying && (
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
                  variant={previewTrack?.id === track.id && isPlaying ? "destructive" : "outline"}
                  size="sm" 
                  onClick={() => onPreviewTrack(track)}
                  className={`flex items-center gap-1 ${
                    previewTrack?.id === track.id && isPlaying
                      ? 'bg-destructive text-destructive-foreground'
                      : 'bg-background/10 backdrop-blur-sm border-muted hover:bg-background/20'
                  }`}
                >
                  {previewTrack?.id === track.id && isPlaying ? (
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
                onSelectPlaylist={(playlist) => onAddToPlaylist(track, playlist)}
                onCreateNew={onCreatePlaylist}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
