import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music as MusicIcon, Play, Pause, Plus, ListMusic, Trash2, X, Radio, ExternalLink, Link2, StopCircle, Volume2, RefreshCw, Trash } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { CreatePlaylistDialog } from "@/components/playlist/create-playlist-dialog";
import { PlaylistSelector } from "@/components/playlist/playlist-selector";
import { Soundscape } from "@/lib/types";
import { Playlist } from "@/components/playlist/types";
import { supabase } from "@/integrations/supabase/client";
import { MobileLayout } from "@/components/mobile-layout";
import { useQuery } from "@tanstack/react-query";
import { ToneEqualizer } from "@/components/music/tone-equalizer";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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
  const { toast: useToastHook } = useToast();
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
  const [isLoading, setIsLoading] = useState(false);

  const { data: radioStreams = [], isLoading: isLoadingStreams, refetch: refetchStreams } = useQuery({
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
        useToastHook({
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

  const handleReloadPage = () => {
    setIsLoading(true);
    
    if (isPlaying || isStreamPlaying) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setIsPlaying(false);
      setIsStreamPlaying(false);
      setPreviewTrack(null);
      setCurrentTrack(null);
      setSelectedPlaylist(null);
      setHiddenIframeUrl(null);
    }
    
    refetchStreams().then(() => {
      useToastHook({
        variant: "default",
        title: "Pagina is ververst",
        description: "Alle content is opnieuw geladen"
      });
      setIsLoading(false);
    }).catch(() => {
      useToastHook({
        variant: "destructive",
        title: "Fout bij verversen",
        description: "Er is een probleem opgetreden bij het verversen van de pagina"
      });
      setIsLoading(false);
    });
  };

  const clearAppCache = () => {
    setIsLoading(true);
    
    if (isPlaying || isStreamPlaying) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setIsPlaying(false);
      setIsStreamPlaying(false);
      setPreviewTrack(null);
      setCurrentTrack(null);
      setSelectedPlaylist(null);
      setHiddenIframeUrl(null);
    }
    
    localStorage.removeItem('processedMeditations');
    localStorage.removeItem('processedSoundscapes');
    localStorage.removeItem('soundscapes');
    localStorage.removeItem('journalEntries');
    localStorage.removeItem('quotes');
    localStorage.removeItem('plannerEvents');
    localStorage.removeItem('todayQuoteId');
    
    refetchStreams().then(() => {
      useToastHook({
        variant: "default",
        title: "Cachegeheugen gewist",
        description: "Alle opgeslagen gegevens zijn verwijderd. De app zal opnieuw worden geladen."
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }).catch(() => {
      useToastHook({
        variant: "destructive",
        title: "Fout bij wissen cache",
        description: "Er is een probleem opgetreden bij het wissen van het cachegeheugen"
      });
      setIsLoading(false);
    });
  };

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
      
      useToastHook({
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
    
    useToastHook({
      title: "Voorluisteren gestopt",
      description: "De muziek is gestopt"
    });
  };

  const handleStreamPlay = (stream: RadioStream) => {
    setHiddenIframeUrl(stream.url);
    
    useToastHook({
      title: "Radio link geopend",
      description: `"${stream.title}" speelt nu in de achtergrond`
    });
  };

  const handleStreamStop = () => {
    setHiddenIframeUrl(null);
    
    useToastHook({
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
        
        useToastHook({
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
      useToastHook({
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
    
    useToastHook({
      title: "Afspeellijst gestart",
      description: `${playlist.name} wordt nu afgespeeld`
    });
  };
  
  const handleStopPlaylist = () => {
    setIsPlaying(false);
    useToastHook({
      title: "Afspeellijst gestopt",
      description: "De afspeellijst is gestopt met afspelen"
    });
  };

  const handleAddToPlaylist = (track: Soundscape, playlist: Playlist) => {
    if (playlist.tracks.some(t => t.trackId === track.id)) {
      useToastHook({
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
    useToastHook({
      title: "Toegevoegd aan afspeellijst",
      description: `${track.title} is toegevoegd aan ${playlist.name}`
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
    
    useToastHook({
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
    useToastHook({
      title: "Afspeellijst aangemaakt",
      description: `Afspeellijst '${name}' is aangemaakt`,
    });
  };

  const getPlaylistTracks = (playlist: Playlist): Soundscape[] => {
    return playlist.tracks
      .map(track => soundscapes.find(s => s.id === track.trackId))
      .filter((track): track is Soundscape => track !== undefined);
  };

  const shouldShowPlayer = isPlaying || isStreamPlaying || hiddenIframeUrl;
  const currentPlayingTrack = previewTrack || currentTrack;

  return (
    <MobileLayout>
      <div className="space-y-6 pb-32">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Ontspannende Muziek</h1>
            <p className="text-muted-foreground">
              Luister naar rustgevende muziek voor meditatie en ontspanning
            </p>
          </div>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  title="Wis cachegeheugen"
                  className="flex-shrink-0"
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cachegeheugen wissen</AlertDialogTitle>
                  <AlertDialogDescription>
                    Weet je zeker dat je het cachegeheugen wilt wissen? Hierdoor worden alle tijdelijk 
                    opgeslagen gegevens verwijderd en moet de app opnieuw worden geladen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuleren</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={clearAppCache}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Wissen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleReloadPage}
              disabled={isLoading}
              className="flex-shrink-0"
              title="Pagina verversen"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="music" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-3 mb-4 sticky top-0 z-30 bg-background">
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
                            onClick={() => handlePreviewTrack(track)}
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
                {radioStreams.map((stream) => {
                  const isPlaying = hiddenIframeUrl === stream.url;
                  
                  return (
                    <Card 
                      key={stream.id} 
                      className={`transition-all ${
                        isPlaying 
                          ? 'ring-2 ring-primary border-primary bg-primary/5' 
                          : 'hover:border-primary/50'
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`p-2 rounded-full ${
                              isPlaying 
                                ? 'bg-primary/20' 
                                : 'bg-green-100/10 dark:bg-green-900/20'
                            }`}>
                              {isPlaying 
                                ? <Volume2 className="h-4 w-4 text-primary animate-pulse" />
                                : <Link2 className="h-4 w-4 text-green-600 dark:text-green-300" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center">
                                <h3 className="font-medium text-sm">{stream.title}</h3>
                                {isPlaying && (
                                  <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary text-xs">
                                    Actief
                                  </Badge>
                                )}
                              </div>
                              {stream.description && (
                                <p className="text-xs text-muted-foreground">{stream.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!isPlaying ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStreamPlay(stream)}
                                className="px-3"
                              >
                                <Play className="h-3.5 w-3.5 mr-1.5" />
                                Afspelen
                              </Button>
                            ) : (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleStreamStop}
                                className="px-3"
                              >
                                <StopCircle className="h-3.5 w-3.5 mr-1.5" />
                                Stop
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Geen radiolinks gevonden</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {shouldShowPlayer && currentPlayingTrack && (
        <div className="fixed bottom-16 left-0 right-0 bg-background border-t shadow-lg z-40 animate-slide-up">
          <div className="mx-auto max-w-4xl px-4 py-2">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <h3 className="font-medium text-sm">
                  {selectedPlaylist ? `${selectedPlaylist.name}: ${currentPlayingTrack.title}` : currentPlayingTrack.title}
                </h3>
                <Badge variant="outline" className="ml-2 text-xs border-primary/50 text-primary animate-pulse">
                  Nu Spelend
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 rounded-full" 
                onClick={previewTrack ? handleStopPreview : () => {
                  setIsPlaying(false);
                  setCurrentTrack(null);
                  setSelectedPlaylist(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <ToneEqualizer 
              isActive={isAudioActive} 
              className="mb-1" 
              audioRef={audioPlayerRef} 
            />
            
            <AudioPlayer 
              audioUrl={currentPlayingTrack.audioUrl}
              nextAudioUrl={nextTrack?.audioUrl}
              showControls={true}
              title={currentPlayingTrack.title}
              className="mb-0"
              onEnded={handleTrackEnded}
              onCrossfadeStart={handleCrossfadeStart}
              isPlayingExternal={isPlaying}
              onPlayPauseChange={setIsPlaying}
              ref={audioPlayerRef}
            />
          </div>
        </div>
      )}
      
      {hiddenIframeUrl && (
        <div className="fixed bottom-16 left-0 right-0 bg-background border-t shadow-lg z-40 animate-slide-up">
          <div className="mx-auto max-w-4xl px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <Volume2 className="h-5 w-5 text-primary mr-2 animate-pulse" />
              <div>
                <h3 className="font-medium text-sm">Radio Stream</h3>
                <p className="text-xs text-muted-foreground">Streaming actief in de achtergrond</p>
              </div>
              <Badge variant="outline" className="ml-2 text-xs border-primary/50 text-primary animate-pulse">
                Live
              </Badge>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleStreamStop}
              className="flex items-center gap-1"
            >
              <StopCircle className="h-4 w-4" />
              Stoppen
            </Button>
          </div>
        </div>
      )}
      
      <iframe 
        ref={hiddenIframeRef}
        src={hiddenIframeUrl || ""}
        style={{ display: 'none' }} 
        title="Radio Stream"
      />
      
      <CreatePlaylistDialog
        open={showPlaylistCreator}
        onOpenChange={setShowPlaylistCreator}
        onSubmit={handleCreatePlaylist}
      />
    </MobileLayout>
  );
};

export default Music;
