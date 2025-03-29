
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListMusic, PlusCircle, Play, Trash2, Music } from "lucide-react";
import { Playlist } from "@/components/playlist/types";
import { Soundscape } from "@/lib/types";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyMusicState } from "@/components/admin/music/EmptyMusicState";

interface PlaylistPanelProps {
  playlists: Playlist[];
  musicTracks: Soundscape[];
  selectedPlaylist: Playlist | null;
  showPlaylistCreator: boolean;
  handlePlayPlaylist: (playlist: Playlist) => void;
  handleAddToPlaylist: (track: Soundscape, playlistId: string) => void;
  handleRemoveFromPlaylist: (trackId: string, playlistId: string) => void;
  handleCreatePlaylist: (name: string) => void;
  setShowPlaylistCreator: (show: boolean) => void;
  getPlaylistTracks: (playlist: Playlist) => Soundscape[];
}

export const PlaylistPanel: React.FC<PlaylistPanelProps> = ({
  playlists,
  musicTracks,
  selectedPlaylist,
  showPlaylistCreator,
  handlePlayPlaylist,
  handleAddToPlaylist,
  handleRemoveFromPlaylist,
  handleCreatePlaylist,
  setShowPlaylistCreator,
  getPlaylistTracks
}) => {
  const [activePlaylistId, setActivePlaylistId] = React.useState<string | null>(null);
  
  const handleSelectPlaylist = (playlistId: string) => {
    setActivePlaylistId(playlistId === activePlaylistId ? null : playlistId);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <ListMusic className="h-6 w-6 text-primary" />
          <span>Afspeellijsten</span>
        </h2>
        <Button onClick={() => setShowPlaylistCreator(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nieuwe Afspeellijst
        </Button>
      </div>
      
      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
          <ListMusic className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Geen afspeellijsten</h3>
          <p className="text-muted-foreground text-center mb-4">
            Maak een nieuwe afspeellijst om je favoriete muziek te organiseren.
          </p>
          <Button onClick={() => setShowPlaylistCreator(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nieuwe Afspeellijst
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => {
            const playlistTracks = getPlaylistTracks(playlist);
            const isActive = activePlaylistId === playlist.id;
            const isPlaying = selectedPlaylist?.id === playlist.id;
            
            return (
              <Card 
                key={playlist.id} 
                className={`transition-shadow border overflow-hidden ${isActive ? 'ring-2 ring-primary' : ''}`}
              >
                <CardHeader className="p-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{playlist.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handlePlayPlaylist(playlist)}
                        disabled={playlist.tracks.length === 0}
                      >
                        <Play className={`h-4 w-4 ${isPlaying ? 'text-primary' : ''}`} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleSelectPlaylist(playlist.id)}
                      >
                        {isActive ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor">
                            <path d="M3 7.5L7.5 3M7.5 3L12 7.5M7.5 3V12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor">
                            <path d="M3 7.5L7.5 12M7.5 12L12 7.5M7.5 12V3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {playlist.tracks.length} {playlist.tracks.length === 1 ? 'nummer' : 'nummers'}
                  </div>
                </CardHeader>
                
                {isActive && (
                  <CardContent className="pt-0 p-4">
                    {playlistTracks.length > 0 ? (
                      <ScrollArea className="h-56 pr-4">
                        <div className="space-y-3">
                          {playlistTracks.map((track) => (
                            <div key={track.id} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/50">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-8 w-8 rounded-sm overflow-hidden shrink-0">
                                  <img 
                                    src={track.coverImageUrl} 
                                    alt={track.title} 
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = "https://via.placeholder.com/80?text=✖";
                                    }}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium truncate">{track.title}</div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                                onClick={() => handleRemoveFromPlaylist(track.id, playlist.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="py-6 text-center text-muted-foreground">
                        Deze afspeellijst is leeg
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Muziek toevoegen:</h4>
                      {musicTracks.length > 0 ? (
                        <ScrollArea className="h-40">
                          <div className="space-y-2">
                            {musicTracks.map((track) => {
                              const isInPlaylist = playlistTracks.some(t => t.id === track.id);
                              
                              return (
                                <div key={track.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="h-8 w-8 rounded-sm overflow-hidden shrink-0">
                                      <img 
                                        src={track.coverImageUrl} 
                                        alt={track.title} 
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.src = "https://via.placeholder.com/80?text=✖";
                                        }}
                                      />
                                    </div>
                                    <div className="min-w-0 truncate">{track.title}</div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    disabled={isInPlaylist}
                                    onClick={() => !isInPlaylist && handleAddToPlaylist(track, playlist.id)}
                                  >
                                    {isInPlaylist ? "Toegevoegd" : "Toevoegen"}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="py-4 text-center text-muted-foreground">
                          Geen muziek beschikbaar
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
