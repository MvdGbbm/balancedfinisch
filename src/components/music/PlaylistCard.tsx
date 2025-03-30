
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Play, StopCircle, Music, Trash2 } from "lucide-react";
import { Soundscape } from "@/lib/types";
import { Playlist } from "@/components/playlist/types";
import { AddTrackToPlaylistButton } from "./AddTrackToPlaylistButton";

interface PlaylistCardProps {
  playlist: Playlist;
  isCurrentPlaylist: boolean;
  isPlaying: boolean;
  playlistTracks: Soundscape[];
  musicTracks: Soundscape[];
  onPlayPlaylist: () => void;
  onStopPlaylist: () => void;
  onRemoveFromPlaylist: (trackId: string) => void;
  onAddToPlaylist: (track: Soundscape, playlistId: string) => void;
  getPlaylistTracks: (playlist: Playlist) => Soundscape[];
  currentTrackId?: string | null;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  isCurrentPlaylist,
  isPlaying,
  playlistTracks,
  musicTracks,
  onPlayPlaylist,
  onStopPlaylist,
  onRemoveFromPlaylist,
  onAddToPlaylist,
  getPlaylistTracks,
  currentTrackId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Card 
      className={`transition-all ${
        isCurrentPlaylist 
          ? 'ring-2 ring-primary border-primary bg-primary/5' 
          : 'bg-background/30 backdrop-blur-sm border-muted'
      }`}
    >
      <CardContent className="p-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div 
              className={`w-12 h-12 relative rounded-md overflow-hidden border ${
                isCurrentPlaylist ? 'border-primary' : 'border-muted'
              }`}
            >
              {playlistTracks.length > 0 ? (
                <img 
                  src={playlistTracks[0].coverImageUrl} 
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/48?text=Playlist";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Music className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              {playlistTracks.length > 1 && (
                <div className="absolute bottom-0 right-0 bg-background/80 text-xs font-medium px-1 rounded-tl">
                  {playlistTracks.length}
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-medium">{playlist.name}</h3>
              <p className="text-sm text-muted-foreground">
                {playlistTracks.length} {playlistTracks.length === 1 ? 'track' : 'tracks'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isCurrentPlaylist ? (
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onStopPlaylist();
                }}
              >
                <StopCircle className="h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayPlaylist();
                }}
                disabled={playlistTracks.length === 0}
              >
                <Play className="h-4 w-4" />
                Afspelen
              </Button>
            )}
            
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 border-t pt-2">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Tracks</h4>
              <div onClick={(e) => e.stopPropagation()}>
                <AddTrackToPlaylistButton 
                  playlist={playlist}
                  musicTracks={musicTracks}
                  onAddToPlaylist={onAddToPlaylist}
                  getPlaylistTracks={getPlaylistTracks}
                />
              </div>
            </div>
            
            {playlistTracks.length > 0 ? (
              <div className="space-y-2">
                {playlistTracks.map((track) => (
                  <div 
                    key={track.id} 
                    className={`flex items-center justify-between p-2 rounded-md ${
                      currentTrackId === track.id && isCurrentPlaylist
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={track.coverImageUrl} 
                          alt={track.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/32?text=Music";
                          }}
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-medium text-sm truncate">{track.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{track.description}</p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromPlaylist(track.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-muted-foreground">
                  Geen tracks in deze afspeellijst
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
