
import React, { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { CreatePlaylistDialog } from "@/components/playlist/create-playlist-dialog";
import { Soundscape } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { MobileLayout } from "@/components/mobile-layout";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Playlist } from "@/components/playlist/types";
import { MusicTrackList } from "@/components/music/music-track-list";
import { PlaylistList } from "@/components/music/playlist-list";
import { RadioStreamList } from "@/components/music/radio-stream-list";
import { FixedPlayer } from "@/components/music/fixed-player";
import { StreamPlayer } from "@/components/music/stream-player";
import { ControlButtons } from "@/components/music/control-buttons";

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
        title: "Pagina is ververst",
        description: "Alle content is opnieuw geladen"
      });
      setIsLoading(false);
    }).catch(() => {
      useToastHook({
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
        title: "Cachegeheugen gewist",
        description: "Alle opgeslagen gegevens zijn verwijderd. De app zal opnieuw worden geladen."
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }).catch(() => {
      useToastHook({
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
        description: "Deze afspeellijst bevat geen nummers."
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
        description: `${track.title} is al toegevoegd aan ${playlist.name}`
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
      description: `Afspeellijst '${name}' is aangemaakt`
    });
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
          <ControlButtons 
            onReload={handleReloadPage}
            onClearCache={clearAppCache}
            isLoading={isLoading}
          />
        </div>

        <Tabs defaultValue="music" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-3 mb-4 sticky top-0 z-30 bg-background">
            <TabsTrigger value="music">Muziek</TabsTrigger>
            <TabsTrigger value="playlists">Afspeellijsten</TabsTrigger>
            <TabsTrigger value="radio">Streaming</TabsTrigger>
          </TabsList>
          
          <TabsContent value="music" className="space-y-4">
            <MusicTrackList
              musicTracks={musicTracks}
              previewTrack={previewTrack}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPreviewTrack={handlePreviewTrack}
              playlists={playlists}
              onAddToPlaylist={handleAddToPlaylist}
              onCreatePlaylist={() => setShowPlaylistCreator(true)}
            />
          </TabsContent>
          
          <TabsContent value="playlists" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowPlaylistCreator(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe afspeellijst
              </Button>
            </div>
            
            <PlaylistList
              playlists={playlists}
              soundscapes={soundscapes}
              currentTrack={currentTrack}
              selectedPlaylist={selectedPlaylist}
              isPlaying={isPlaying}
              onPlayPlaylist={handlePlayPlaylist}
              onStopPlaylist={handleStopPlaylist}
              onRemoveFromPlaylist={handleRemoveFromPlaylist}
              onCreatePlaylist={() => setShowPlaylistCreator(true)}
            />
          </TabsContent>
          
          <TabsContent value="radio" className="space-y-4">
            <RadioStreamList
              streams={radioStreams}
              activeStreamUrl={hiddenIframeUrl}
              onPlayStream={handleStreamPlay}
              onStopStream={handleStreamStop}
              isLoading={isLoadingStreams}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {shouldShowPlayer && currentPlayingTrack && (
        <FixedPlayer
          currentTrack={currentPlayingTrack}
          nextTrack={nextTrack}
          isPlaying={isPlaying}
          isAudioActive={isAudioActive}
          selectedPlaylist={selectedPlaylist}
          onStop={previewTrack ? handleStopPreview : () => {
            setIsPlaying(false);
            setCurrentTrack(null);
            setSelectedPlaylist(null);
          }}
          onTrackEnded={handleTrackEnded}
          onCrossfadeStart={handleCrossfadeStart}
          onPlayPauseChange={setIsPlaying}
          audioRef={audioPlayerRef}
        />
      )}
      
      {hiddenIframeUrl && (
        <StreamPlayer onStop={handleStreamStop} />
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
