import React, { useState, useEffect, useRef } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music as MusicIcon, Play, Pause, Plus, ListMusic, Trash2, X, Radio, ExternalLink, Link2, StopCircle, Square } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Soundscape } from "@/lib/types";
import { Playlist, PlaylistTrack } from "@/components/playlist/types";
import { PlaylistSelector } from "@/components/playlist/playlist-selector";
import { CreatePlaylistDialog } from "@/components/playlist/create-playlist-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface RadioStream {
  id: string;
  title: string;
  url: string;
  description: string | null;
  is_active: boolean;
  position: number | null;
  cover_image_url?: string | null;
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
  const hiddenIframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState<string>("music");
  const [isAudioActive, setIsAudioActive] = useState(false);
  const visibleAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

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

  const stopAllAudio = () => {
    console.log("Stopping all audio playback");
    
    if (previewTrack && previewAudioRef.current) {
      previewAudioRef.current.pause();
      setPreviewTrack(null);
      setIsPlaying(false);
    }
    
    if (isStreamPlaying) {
      setIsStreamPlaying(false);
      setStreamUrl("");
      setStreamTitle("");
    }
    
    if (hiddenIframeUrl) {
      setHiddenIframeUrl(null);
    }
    
    if (selectedPlaylist && visibleAudioRef.current) {
      visibleAudioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handlePreviewTrack = (track: Soundscape) => {
    stopAllAudio();
    
    if (previewTrack?.id === track.id && isPlaying) {
      setPreviewTrack(null);
      setIsPlaying(false);
      
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      
      toast({
        title: "Voorluisteren gestopt",
        description: `${track.title} is gestopt.`
      });
    } else {
      setPreviewTrack(track);
      setIsPlaying(true);
      setSelectedPlaylist(null);
      setNextTrack(null);
      
      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio(track.audioUrl);
        previewAudioRef.current.volume = 0.8;
        previewAudioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
          setPreviewTrack(null);
        });
      } else {
        previewAudioRef.current.src = track.audioUrl;
        previewAudioRef.current.load();
      }
      
      const playPromise = previewAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Error playing audio:", error);
          toast({
            variant: "destructive",
            title: "Fout bij afspelen",
            description: "Kon de audio niet afspelen. Probeer het later opnieuw."
          });
          setIsPlaying(false);
          setPreviewTrack(null);
        });
      }
      
      toast({
        title: "Voorluisteren gestart",
        description: `${track.title} wordt nu afgespeeld.`
      });
    }
  };

  const handleStopPreview = () => {
    if (previewTrack && isPlaying) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      
      setPreviewTrack(null);
      setIsPlaying(false);
      
      toast({
        title: "Voorluisteren gestopt",
        description: "Het afspelen is gestopt."
      });
    }
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
    if (selectedPlaylist?.id === playlist.id && isPlaying) {
      stopAllAudio();
      return;
    }
    
    stopAllAudio();
    
    if (playlist.tracks.length === 0) {
      toast({
        title: "Lege afspeellijst",
        description: "Deze afspeellijst bevat geen nummers.",
        variant: "destructive"
      });
      return;
    }
    
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

  const handleAudioElementRef = (element: HTMLAudioElement | null) => {
    visibleAudioRef.current = element;
  };

  const renderAudioPlayer = () => {
    if (isStreamPlaying && streamUrl) {
      return (
        <div className="mb-2 bg-muted/30 rounded-lg p-2">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-medium text-sm">
              {streamTitle} <span className="text-xs text-primary">LIVE</span>
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setIsStreamPlaying(false);
                setStreamUrl("");
                setStreamTitle("");
              }}
              className="h-6 w-6 p-0"
            >
              <Square className="h-3 w-3" />
            </Button>
          </div>
          <AudioPlayer 
            audioUrl={streamUrl} 
            showControls={true}
            title={streamTitle}
            isPlayingExternal={isStreamPlaying}
            onPlayPauseChange={setIsStreamPlaying}
            onAudioElementRef={handleAudioElementRef}
            className="bg-card/30 rounded-md"
          />
        </div>
      );
    }

    if (previewTrack && isPlaying) {
      return (
        <div className="mb-2 bg-muted/30 rounded-lg p-2">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              {previewTrack.coverImageUrl && (
                <img 
                  src={previewTrack.coverImageUrl} 
                  alt={previewTrack.title} 
                  className="h-6 w-6 rounded object-cover"
                />
              )}
              <h3 className="font-medium text-sm truncate max-w-[200px]">
                {previewTrack.title}
              </h3>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleStopPreview}
              className="h-6 w-6 p-0"
            >
              <Square className="h-3 w-3" />
            </Button>
          </div>
          <AudioPlayer 
            audioUrl={previewTrack.audioUrl}
            showControls={true}
            isPlayingExternal={isPlaying}
            onPlayPauseChange={setIsPlaying}
            className="bg-card/30 rounded-md"
          />
        </div>
      );
    }

    if (selectedPlaylist && currentTrack) {
      return (
        <div className="mb-2 bg-muted/30 rounded-lg p-2">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              {currentTrack.coverImageUrl && (
                <img 
                  src={currentTrack.coverImageUrl} 
                  alt={currentTrack.title} 
                  className="h-6 w-6 rounded object-cover"
                />
              )}
              <div className="truncate max-w-[200px]">
                <h3 className="font-medium text-sm">{currentTrack.title}</h3>
                <p className="text-xs text-muted-foreground">{selectedPlaylist.name}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSelectedPlaylist(null);
                setCurrentTrack(null);
                setIsPlaying(false);
              }}
              className="h-6 w-6 p-0"
            >
              <Square className="h-3 w-6 p-0"
            </Button>
          </div>
          <AudioPlayer 
            audioUrl={currentTrack.audioUrl}
            nextAudioUrl={nextTrack?.audioUrl}
            showControls={true}
            onEnded={handleTrackEnded}
            onCrossfadeStart={handleCrossfadeStart}
            isPlayingExternal={isPlaying}
            onPlayPauseChange={setIsPlaying}
            onAudioElementRef={handleAudioElementRef}
            className="bg-card/30 rounded-md"
          />
        </div>
      );
    }

    return (
      <div className="mb-2 bg-muted/30 rounded-lg p-2">
        <div className="flex items-center justify-center py-1">
          <p className="text-sm text-muted-foreground">Geen audio geselecteerd</p>
        </div>
      </div>
    );
  };

  return (
    <MobileLayout>
      <div className="space-y-4">
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
          
          <div className="mb-4">
            {renderAudioPlayer()}
          </div>
          
          <TabsContent value="music" className="space-y-4">
            {musicTracks.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {musicTracks.map((track) => (
                  <Card 
                    key={track.id} 
                    className={`transition-all ${previewTrack?.id === track.id ? 'ring-2 ring-primary' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {track.coverImageUrl ? (
                          <img 
                            src={track.coverImageUrl} 
                            alt={track.title}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                        ) : (
                          <div className={`p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 ${previewTrack?.id === track.id ? 'bg-primary/20' : ''}`}>
                            <MusicIcon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className={`font-medium ${previewTrack?.id === track.id ? 'text-primary' : ''}`}>{track.title}</h3>
                          <p className="text-sm text-muted-foreground">{track.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-3">
                        {previewTrack?.id === track.id && isPlaying ? (
                          <Button 
                            variant="default"
                            size="sm" 
                            onClick={() => handlePreviewTrack(track)}
                            className="flex items-center gap-1"
                          >
                            <Pause className="h-4 w-4" />
                            Stop voorluisteren
                          </Button>
                        ) : (
                          <Button 
                            variant="outline"
                            size="sm" 
                            onClick={() => handlePreviewTrack(track)}
                            className="flex items-center gap-1"
                          >
                            <Play className="h-4 w-4" />
                            Voorluisteren
                          </Button>
                        )}
                        
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
                  const isCurrentlyPlaying = selectedPlaylist?.id === playlist.id && isPlaying;
                  
                  return (
                    <Card key={playlist.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${isCurrentlyPlaying ? 'bg-primary/30' : 'bg-primary/20'}`}>
                            <ListMusic className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-medium ${isCurrentlyPlaying ? 'text-primary' : ''}`}>{playlist.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {trackCount} {trackCount === 1 ? 'nummer' : 'nummers'}
                            </p>
                          </div>
                          <Button
                            variant={isCurrentlyPlaying ? "secondary" : "default"}
                            size="sm"
                            onClick={() => handlePlayPlaylist(playlist)}
                            disabled={trackCount === 0}
                          >
                            {isCurrentlyPlaying ? (
                              <>
                                <Square className="h-4 w-4 mr-1" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-1" />
                                Lijst afspelen
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {playlist.tracks.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <h4 className="text-sm font-medium">Nummers:</h4>
                            <div className="pl-2 space-y-1">
                              {getPlaylistTracks(playlist).map((track, index) => (
                                <div 
                                  key={track.id} 
                                  className={`flex items-center justify-between text-sm group py-1 px-2 rounded-md hover:bg-muted ${
                                    isCurrentlyPlaying && currentTrackIndex === index ? 'bg-primary/10' : ''
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <span className="w-5 text-muted-foreground">{index + 1}.</span>
                                    <span className={isCurrentlyPlaying && currentTrackIndex === index ? 'text-primary' : ''}>
                                      {track.title}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
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
                          {stream.cover_image_url ? (
                            <img 
                              src={stream.cover_image_url} 
                              alt={stream.title}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300">
                              <Link2 className="h-4 w-4" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm">{stream.title}</h3>
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
