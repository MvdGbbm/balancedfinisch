
import React, { useState, useEffect, useRef } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Soundscape } from "@/lib/types";
import { Playlist } from "@/components/playlist/types";
import { CreatePlaylistDialog } from "@/components/playlist/create-playlist-dialog";
import { MusicPageTabs } from "@/components/music/music-page-tabs";
import { MusicPlayer } from "@/components/music/music-player";
import { RadioStream } from "@/components/music/types";

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

  const handleToggleFavorite = (track: Soundscape) => {
    const updatedTrack = {
      ...track,
      isFavorite: !track.isFavorite
    };
    
    const updatedTracks = musicTracks.map(t => 
      t.id === track.id ? updatedTrack : t
    );
    
    setMusicTracks(updatedTracks);
    
    toast({
      title: track.isFavorite ? "Verwijderd uit favorieten" : "Toegevoegd aan favorieten",
      description: track.isFavorite 
        ? `${track.title} is verwijderd uit je favorieten.` 
        : `${track.title} is toegevoegd aan je favorieten.`
    });
  };

  return (
    <MobileLayout>
      <div className="space-y-6 pb-32">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Ontspannende Muziek</h1>
          <p className="text-muted-foreground">
            Luister naar rustgevende muziek voor meditatie en ontspanning
          </p>
        </div>

        <MusicPageTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          musicTracks={musicTracks}
          playlists={playlists}
          radioStreams={radioStreams}
          isLoadingStreams={isLoadingStreams}
          isPlaying={isPlaying}
          previewTrack={previewTrack}
          currentTrack={currentTrack}
          selectedPlaylist={selectedPlaylist}
          hiddenIframeUrl={hiddenIframeUrl}
          onPlayTrack={handlePreviewTrack}
          onAddToPlaylist={handleAddToPlaylist}
          onCreatePlaylist={() => setShowPlaylistCreator(true)}
          onToggleFavorite={handleToggleFavorite}
          onPlayPlaylist={handlePlayPlaylist}
          onStopPlaylist={handleStopPlaylist}
          onRemoveFromPlaylist={handleRemoveFromPlaylist}
          onStreamPlay={handleStreamPlay}
          onStreamStop={handleStreamStop}
        />
      </div>
      
      <MusicPlayer
        currentTrack={currentTrack}
        nextTrack={nextTrack}
        isPlaying={isPlaying}
        isStreamPlaying={isStreamPlaying}
        hiddenIframeUrl={hiddenIframeUrl}
        streamTitle={streamTitle}
        isAudioActive={isAudioActive}
        audioRef={audioPlayerRef}
        selectedPlaylist={selectedPlaylist}
        previewTrack={previewTrack}
        onStopPreview={handleStopPreview}
        onStopPlaylist={handleStopPlaylist}
        onStopStream={handleStreamStop}
        onTrackEnded={handleTrackEnded}
        onCrossfadeStart={handleCrossfadeStart}
        setIsPlaying={setIsPlaying}
      />
      
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
