import React, { useState, useEffect, useRef } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music as MusicIcon, Play, Pause, Plus, ListMusic, Trash2, X } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Soundscape } from "@/lib/types";
import { Playlist, PlaylistTrack } from "@/components/playlist/types";
import { PlaylistSelector } from "@/components/playlist/playlist-selector";
import { CreatePlaylistDialog } from "@/components/playlist/create-playlist-dialog";

const Music = () => {
  const { soundscapes } = useApp();
  const { toast } = useToast();
  const [currentTrack, setCurrentTrack] = useState<Soundscape | null>(null);
  const [previewTrack, setPreviewTrack] = useState<Soundscape | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicTracks, setMusicTracks] = useState<Soundscape[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showPlaylistCreator, setShowPlaylistCreator] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [nextTrackUrl, setNextTrackUrl] = useState<string | undefined>(undefined);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const filteredTracks = soundscapes.filter(track => track.category === "Muziek");
    setMusicTracks(filteredTracks);
    
    const storedPlaylists = localStorage.getItem('musicPlaylists');
    if (storedPlaylists) {
      try {
        setPlaylists(JSON.parse(storedPlaylists));
      } catch (error) {
        console.error("Error parsing playlists:", error);
      }
    }
  }, [soundscapes]);

  useEffect(() => {
    localStorage.setItem('musicPlaylists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    if (selectedPlaylist && selectedPlaylist.tracks.length > 1 && currentTrack) {
      const nextIndex = (currentTrackIndex + 1) % selectedPlaylist.tracks.length;
      const nextTrackId = selectedPlaylist.tracks[nextIndex].trackId;
      const nextTrack = soundscapes.find(s => s.id === nextTrackId);
      
      if (nextTrack) {
        setNextTrackUrl(nextTrack.audioUrl);
        console.log("Next track for crossfade:", nextTrack.title);
      } else {
        setNextTrackUrl(undefined);
      }
    } else {
      setNextTrackUrl(undefined);
    }
  }, [selectedPlaylist, currentTrackIndex, currentTrack, soundscapes]);

  const handlePreviewTrack = (track: Soundscape) => {
    setPreviewTrack(track);
    setIsPlaying(true);
    
    setSelectedPlaylist(null);
  };

  const handleTrackEnded = () => {
    if (selectedPlaylist && selectedPlaylist.tracks.length > 0) {
      const nextIndex = (currentTrackIndex + 1) % selectedPlaylist.tracks.length;
      setCurrentTrackIndex(nextIndex);
      
      const nextTrackId = selectedPlaylist.tracks[nextIndex].trackId;
      const nextTrack = soundscapes.find(s => s.id === nextTrackId) || null;
      
      setCurrentTrack(nextTrack);
      setIsPlaying(true);
      
      toast({
        title: "Volgende nummer",
        description: `Nu speelt: ${nextTrack?.title}`
      });
    }
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length === 0) {
      toast({
        title: "Lege afspeellijst",
        description: "Deze afspeellijst bevat geen nummers.",
        variant: "destructive"
      });
      return;
    }
    
    setPreviewTrack(null);
    
    setSelectedPlaylist(playlist);
    setCurrentTrackIndex(0);
    
    const firstTrackId = playlist.tracks[0].trackId;
    const track = soundscapes.find(s => s.id === firstTrackId) || null;
    setCurrentTrack(track);
    setIsPlaying(true);
    
    toast({
      title: "Afspeellijst gestart",
      description: `${playlist.name} wordt nu afgespeeld`
    });
  };

  const handleAddToPlaylist = (track: Soundscape, playlist: Playlist) => {
    if (playlist.tracks.some(t => t.trackId === track.id)) {
      toast({
        title: "Track bestaat al in afspeellijst",
        description: `${track.title} is al toegevoegd aan ${playlist.name}`,
        variant: "destructive"
      });
      return;
    }
    
    const updatedPlaylist = {
      ...playlist,
      tracks: [
        ...playlist.tracks,
        { trackId: track.id, added: new Date().toISOString() }
      ]
    };
    
    const updatedPlaylists = playlists.map(p => 
      p.id === playlist.id ? updatedPlaylist : p
    );
    
    setPlaylists(updatedPlaylists);
    toast({
      title: "Toegevoegd aan afspeellijst",
      description: `${track.title} is toegevoegd aan ${playlist.name}`,
    });
  };

  const handleRemoveFromPlaylist = (trackId: string, playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    
    const updatedPlaylist = {
      ...playlist,
      tracks: playlist.tracks.filter(t => t.trackId !== trackId)
    };
    
    const updatedPlaylists = playlists.map(p => 
      p.id === playlistId ? updatedPlaylist : p
    );
    
    setPlaylists(updatedPlaylists);
    
    if (selectedPlaylist?.id === playlistId) {
      if (selectedPlaylist.tracks[currentTrackIndex]?.trackId === trackId) {
        if (updatedPlaylist.tracks.length === 0) {
          setSelectedPlaylist(null);
          setCurrentTrack(null);
          setIsPlaying(false);
        } else {
          const newIndex = Math.min(currentTrackIndex, updatedPlaylist.tracks.length - 1);
          setCurrentTrackIndex(newIndex);
          const newTrackId = updatedPlaylist.tracks[newIndex].trackId;
          const newTrack = soundscapes.find(s => s.id === newTrackId) || null;
          setCurrentTrack(newTrack);
        }
      }
      setSelectedPlaylist(updatedPlaylist);
    }
    
    toast({
      title: "Nummer verwijderd",
      description: "Het nummer is verwijderd uit de afspeellijst."
    });
  };

  const handleCreatePlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      tracks: [],
      createdAt: new Date().toISOString()
    };
    
    setPlaylists([...playlists, newPlaylist]);
    setShowPlaylistCreator(false);
    toast({
      title: "Afspeellijst aangemaakt",
      description: `Afspeellijst '${name}' is aangemaakt`,
    });
  };

  const getPlaylistTracks = (playlist: Playlist): Soundscape[] => {
    return playlist.tracks
      .map(track => soundscapes.find(s => s.id === track.trackId))
      .filter((track): track is Soundscape => track !== undefined);
  };

  return (
    <MobileLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Ontspannende Muziek</h1>
          <p className="text-muted-foreground">
            Luister naar rustgevende muziek voor meditatie en ontspanning
          </p>
        </div>

        <Tabs defaultValue="music">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="music">Muziek</TabsTrigger>
            <TabsTrigger value="playlists">Afspeellijsten</TabsTrigger>
          </TabsList>
          
          <TabsContent value="music" className="space-y-4">
            {musicTracks.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {musicTracks.map((track) => (
                  <Card 
                    key={track.id} 
                    className={`transition-all ${currentTrack?.id === track.id ? 'ring-2 ring-primary' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 ${currentTrack?.id === track.id ? 'bg-primary/20' : ''}`}>
                          <MusicIcon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{track.title}</h3>
                          <p className="text-sm text-muted-foreground">{track.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handlePreviewTrack(track)}
                          className="flex items-center gap-1"
                        >
                          <Play className="h-4 w-4" />
                          Voorluisteren
                        </Button>
                        
                        <PlaylistSelector 
                          playlists={playlists}
                          onSelectPlaylist={(playlist) => handleAddToPlaylist(track, playlist)}
                          onCreateNew={() => setShowPlaylistCreator(true)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Geen muziek tracks gevonden</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="playlists" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowPlaylistCreator(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe afspeellijst
              </Button>
            </div>
            
            {playlists.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {playlists.map((playlist) => {
                  const trackCount = playlist.tracks.length;
                  return (
                    <Card key={playlist.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/20">
                            <ListMusic className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{playlist.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {trackCount} {trackCount === 1 ? 'nummer' : 'nummers'}
                            </p>
                          </div>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePlayPlaylist(playlist)}
                            disabled={trackCount === 0}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Lijst afspelen
                          </Button>
                        </div>
                        
                        {playlist.tracks.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <h4 className="text-sm font-medium">Nummers:</h4>
                            <div className="pl-2 space-y-1">
                              {getPlaylistTracks(playlist).map((track, index) => (
                                <div 
                                  key={track.id} 
                                  className="flex items-center justify-between text-sm group py-1 px-2 rounded-md hover:bg-muted"
                                >
                                  <div className="flex items-center">
                                    <span className="w-5 text-muted-foreground">{index + 1}.</span>
                                    <span>{track.title}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleRemoveFromPlaylist(track.id, playlist.id)}
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
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Geen afspeellijsten gevonden</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setShowPlaylistCreator(true)}
                >
                  Maak je eerste afspeellijst
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {previewTrack && (
          <div className="mb-14">
            <h3 className="font-medium mb-2">Voorluisteren: {previewTrack.title}</h3>
            <AudioPlayer 
              audioUrl={previewTrack.audioUrl} 
              showControls={true}
              title={previewTrack.title}
              isPlayingExternal={isPlaying}
              onPlayPauseChange={setIsPlaying}
            />
          </div>
        )}
        
        {selectedPlaylist && currentTrack && (
          <div className="fixed bottom-16 left-0 right-0 bg-background border-t p-4 animate-slide-up z-10">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">Speelt nu: {selectedPlaylist.name}</h4>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => {
                  setSelectedPlaylist(null);
                  setCurrentTrack(null);
                  setIsPlaying(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <AudioPlayer 
              audioUrl={currentTrack.audioUrl} 
              showControls={true}
              title={currentTrack.title}
              className="mb-0"
              onEnded={handleTrackEnded}
              isPlayingExternal={isPlaying}
              onPlayPauseChange={setIsPlaying}
              nextTrackUrl={nextTrackUrl}
              enableCrossfade={true}
            />
          </div>
        )}
      </div>
      
      <CreatePlaylistDialog
        open={showPlaylistCreator}
        onOpenChange={setShowPlaylistCreator}
        onSubmit={handleCreatePlaylist}
      />
    </MobileLayout>
  );
};

export default Music;
