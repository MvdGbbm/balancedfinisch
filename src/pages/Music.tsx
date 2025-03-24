import React, { useState, useEffect, useRef } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music as MusicIcon, Play, Pause, Plus, ListMusic, Trash2, X, Radio, ExternalLink, Link2, StopCircle } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Soundscape } from "@/lib/types";
import { Playlist, PlaylistTrack } from "@/components/playlist/types";
import { PlaylistSelector } from "@/components/playlist/playlist-selector";
import { CreatePlaylistDialog } from "@/components/playlist/create-playlist-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ToneEqualizer } from "@/components/music/tone-equalizer";

interface RadioStream {
  id: string;
  title: string;
  url: string;
  description: string | null;
  is_active: boolean;
  position: number | null;
}

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
  const [nextTrack, setNextTrack] = useState<Soundscape | null>(null);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const [isStreamPlaying, setIsStreamPlaying] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");
  const [streamTitle, setStreamTitle] = useState("");
  const [hiddenIframeUrl, setHiddenIframeUrl] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const hiddenIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [activeTab, setActiveTab] = useState<string>("music");
  const [isAudioActive, setIsAudioActive] = useState(false);

  const { data: radioStreams = [], isLoading: isLoadingStreams } = useQuery({
    queryKey: ['activeRadioStreams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('radio_streams')
        .select('*')
        .eq('is_active', true)
        .order('position')
        .order('title');
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
    meta: {
      onError: (error: Error) => {
        console.error("Error fetching radio streams:", error);
        toast({
          variant: "destructive",
          title: "Fout bij laden",
          description: "Kon de radiostreams niet laden."
        });
      }
    }
  });

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
    if (selectedPlaylist && selectedPlaylist.tracks.length > 0 && currentTrack) {
      const nextIndex = (currentTrackIndex + 1) % selectedPlaylist.tracks.length;
      const nextTrackId = selectedPlaylist.tracks[nextIndex].trackId;
      const nextTrackObj = soundscapes.find(s => s.id === nextTrackId) || null;
      setNextTrack(nextTrackObj);
    } else {
      setNextTrack(null);
    }
  }, [currentTrack, currentTrackIndex, selectedPlaylist, soundscapes]);

  useEffect(() => {
    setIsAudioActive(isPlaying || isStreamPlaying);
  }, [isPlaying, isStreamPlaying]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value !== activeTab) {
      if (isPlaying) {
        setIsPlaying(false);
        setPreviewTrack(null);
        setCurrentTrack(null);
        setSelectedPlaylist(null);
      }
      
      if (isStreamPlaying || hiddenIframeUrl) {
        setIsStreamPlaying(false);
        setStreamUrl("");
        setStreamTitle("");
        setHiddenIframeUrl(null);
      }
    }
  };

  const handlePreviewTrack = (track: Soundscape) => {
    if (isStreamPlaying) {
      setIsStreamPlaying(false);
      setStreamUrl("");
      setStreamTitle("");
    }
    
    if (previewTrack?.id === track.id && isPlaying) {
      setPreviewTrack(null);
      setIsPlaying(false);
      
      toast({
        title: "Voorluisteren gestopt",
        description: `${track.title} is gestopt met afspelen`
      });
      return;
    }
    
    setPreviewTrack(track);
    setIsPlaying(true);
    
    setSelectedPlaylist(null);
    setNextTrack(null);
  };

  const handleStopPreview = () => {
    setPreviewTrack(null);
    setIsPlaying(false);
    
    toast({
      title: "Voorluisteren gestopt",
      description: "De muziek is gestopt"
    });
  };

  const handleStreamPlay = (stream: RadioStream) => {
    setHiddenIframeUrl(stream.url);
    
    toast({
      title: "Radio link geopend",
      description: `"${stream.title}" speelt nu in de achtergrond`
    });
  };

  const handleStreamStop = () => {
    setHiddenIframeUrl(null);
    
    toast({
      title: "Streaming gestopt",
      description: "De streaming verbinding is verbroken"
    });
  };

  const handleTrackEnded = () => {
    console.info("Track ended callback");
    
    if (selectedPlaylist && selectedPlaylist.tracks.length > 0) {
      const nextIndex = (currentTrackIndex + 1) % selectedPlaylist.tracks.length;
      setCurrentTrackIndex(nextIndex);
      
      const nextTrackId = selectedPlaylist.tracks[nextIndex].trackId;
      const nextTrackObj = soundscapes.find(s => s.id === nextTrackId) || null;
      
      if (nextTrackObj) {
        setCurrentTrack(nextTrackObj);
        setIsPlaying(true);
        
        toast({
          title: "Volgende nummer",
          description: `Nu speelt: ${nextTrackObj.title}`
        });
      }
    }
  };

  const handleCrossfadeStart = () => {
    console.info("Started playing next track for crossfade");
    setIsCrossfading(true);
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (isStreamPlaying) {
      setIsStreamPlaying(false);
      setStreamUrl("");
      setStreamTitle("");
    }
    
    if (playlist.tracks.length === 0) {
      toast({
        title: "Lege afspeellijst",
        description: "Deze afspeellijst bevat geen nummers.",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedPlaylist?.id === playlist.id && isPlaying) {
      handleStopPlaylist();
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
  
  const handleStopPlaylist = () => {
    setIsPlaying(false);
    toast({
      title: "Afspeellijst gestopt",
      description: "De afspeellijst is gestopt met afspelen"
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

        <Tabs defaultValue="music" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="music">Muziek</TabsTrigger>
            <TabsTrigger value="playlists">Afspeellijsten</TabsTrigger>
            <TabsTrigger value="radio">Streaming</TabsTrigger>
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
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handlePreviewTrack(track)}
                            className="flex items-center gap-1"
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
                  const isCurrentPlaylist = selectedPlaylist?.id === playlist.id && isPlaying;
                  
                  return (
                    <Card key={playlist.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/20">
                            <ListMusic className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium">{playlist.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {trackCount} {trackCount === 1 ? 'nummer' : 'nummers'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {isCurrentPlaylist ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleStopPlaylist()}
                              >
                                <StopCircle className="h-4 w-4 mr-1" />
                                Stoppen
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handlePlayPlaylist(playlist)}
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
                        
                        {isCurrentPlaylist && currentTrack && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <ToneEqualizer 
                              isActive={isPlaying} 
                              className="bg-black/50 mb-2" 
                              audioRef={audioPlayerRef} 
                            />
                            <AudioPlayer 
                              audioUrl={currentTrack.audioUrl}
                              title={currentTrack.title}
                              showControls={true}
                              isPlayingExternal={isPlaying}
                              onPlayPauseChange={setIsPlaying}
                              ref={audioPlayerRef}
                            />
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
          
          <TabsContent value="radio" className="space-y-4">
            {isLoadingStreams ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : radioStreams.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {radioStreams.map((stream) => (
                  <Card key={stream.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300">
                            <Link2 className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm">{stream.title}</h3>
                            {stream.description && (
                              <p className="text-xs text-muted-foreground">{stream.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStreamPlay(stream)}
                            className="px-3"
                          >
                            <Play className="h-3.5 w-3.5 mr-1.5" />
                            Afspelen
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleStreamStop}
                            className="px-3"
                            disabled={!hiddenIframeUrl}
                          >
                            <StopCircle className="h-3.5 w-3.5 mr-1.5" />
                            Stop
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Geen radiolinks gevonden</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {previewTrack && (
          <div className="mb-14">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Voorluisteren: {previewTrack.title}</h3>
              <Button 
                variant="destructive"
                size="sm"
                onClick={handleStopPreview}
              >
                <StopCircle className="h-4 w-4 mr-1" />
                Stoppen
              </Button>
            </div>
            <ToneEqualizer 
              isActive={isPlaying} 
              className="mb-2" 
              audioRef={audioPlayerRef} 
            />
            <AudioPlayer 
              audioUrl={previewTrack.audioUrl} 
              showControls={true}
              title={previewTrack.title}
              isPlayingExternal={isPlaying}
              onPlayPauseChange={setIsPlaying}
              ref={audioPlayerRef}
            />
          </div>
        )}
        
        {isStreamPlaying && (
          <div className="mb-14">
            <h3 className="font-medium mb-2">
              {streamTitle} <span className="text-xs text-primary">LIVE</span>
            </h3>
            <AudioPlayer 
              audioUrl={streamUrl} 
              showControls={true}
              title={streamTitle}
              isPlayingExternal={isStreamPlaying}
              onPlayPauseChange={setIsStreamPlaying}
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
            <ToneEqualizer 
              isActive={isPlaying} 
              className="mb-2" 
              audioRef={audioPlayerRef} 
            />
            <AudioPlayer 
              audioUrl={currentTrack.audioUrl}
              nextAudioUrl={nextTrack?.audioUrl}
              showControls={true}
              title={currentTrack.title}
              className="mb-0"
              onEnded={handleTrackEnded}
              onCrossfadeStart={handleCrossfadeStart}
              isPlayingExternal={isPlaying}
              onPlayPauseChange={setIsPlaying}
              ref={audioPlayerRef}
            />
          </div>
        )}
        
        {hiddenIframeUrl && (
          <iframe 
            ref={hiddenIframeRef}
            src={hiddenIframeUrl}
            style={{ display: 'none' }} 
            title="Radio Stream"
          />
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
