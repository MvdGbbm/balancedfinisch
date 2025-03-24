
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Music, 
  ListMusic, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  FileMusic
} from "lucide-react";
import { Track, Playlist } from "@/lib/types";
import { tracks as initialTracks, playlists as initialPlaylists, createTrack, createPlaylist, getTracksForPlaylist } from "@/data/music";
import { TrackItem } from "@/components/music/track-item";
import { formatDuration } from "@/lib/utils";
import { toast } from "sonner";

const AdminMusic = () => {
  const [currentTab, setCurrentTab] = useState("tracks");
  const [isPlayingTrack, setIsPlayingTrack] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Track management
  const [isTrackDialogOpen, setIsTrackDialogOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [trackFormData, setTrackFormData] = useState({
    title: "",
    artist: "",
    audioUrl: "",
    coverImageUrl: "",
    duration: 0,
    album: "",
    year: undefined as number | undefined,
    genre: "",
    tags: ""
  });
  
  // Tracks and playlists state
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists);
  
  // Playlist management
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [playlistFormData, setPlaylistFormData] = useState({
    name: "",
    description: "",
    coverImageUrl: "",
    tracks: [] as string[]
  });
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  
  useEffect(() => {
    if (audioElement) {
      const handleEnded = () => {
        setIsPlayingTrack(null);
      };
      
      audioElement.addEventListener('ended', handleEnded);
      
      return () => {
        audioElement.removeEventListener('ended', handleEnded);
      };
    }
  }, [audioElement]);
  
  useEffect(() => {
    if (currentPlaylist) {
      const playlistTracks = getTracksForPlaylist(currentPlaylist.id);
      setPlaylistTracks(playlistTracks);
      setSelectedTrackIds(currentPlaylist.tracks);
      
      // Set available tracks (tracks not in the playlist)
      const playlistTrackIds = new Set(currentPlaylist.tracks);
      setAvailableTracks(tracks.filter(track => !playlistTrackIds.has(track.id)));
    } else {
      setPlaylistTracks([]);
      setAvailableTracks(tracks);
    }
  }, [currentPlaylist, tracks]);
  
  // Handle track playback
  const handlePlayTrack = (trackId: string, audioUrl: string) => {
    if (isPlayingTrack === trackId) {
      // Pause the current track
      if (audioElement) {
        audioElement.pause();
      }
      setIsPlayingTrack(null);
    } else {
      // Play a new track
      if (audioElement) {
        audioElement.pause();
      }
      
      const audio = new Audio(audioUrl);
      audio.play();
      setAudioElement(audio);
      setIsPlayingTrack(trackId);
    }
  };
  
  // Track form handlers
  const resetTrackForm = () => {
    setTrackFormData({
      title: "",
      artist: "",
      audioUrl: "",
      coverImageUrl: "",
      duration: 0,
      album: "",
      year: undefined,
      genre: "",
      tags: ""
    });
  };
  
  const handleOpenNewTrack = () => {
    setCurrentTrack(null);
    resetTrackForm();
    setIsTrackDialogOpen(true);
  };
  
  const handleEditTrack = (track: Track) => {
    setCurrentTrack(track);
    setTrackFormData({
      title: track.title,
      artist: track.artist,
      audioUrl: track.audioUrl,
      coverImageUrl: track.coverImageUrl || "",
      duration: track.duration,
      album: track.album || "",
      year: track.year,
      genre: track.genre || "",
      tags: track.tags?.join(", ") || ""
    });
    setIsTrackDialogOpen(true);
  };
  
  const handleSaveTrack = () => {
    if (!trackFormData.title || !trackFormData.artist || !trackFormData.audioUrl) {
      toast.error("Vul alle verplichte velden in");
      return;
    }
    
    const tagArray = trackFormData.tags
      ? trackFormData.tags.split(",").map(tag => tag.trim())
      : [];
    
    const trackData = {
      title: trackFormData.title,
      artist: trackFormData.artist,
      audioUrl: trackFormData.audioUrl,
      coverImageUrl: trackFormData.coverImageUrl || undefined,
      duration: trackFormData.duration,
      album: trackFormData.album || undefined,
      year: trackFormData.year,
      genre: trackFormData.genre || undefined,
      tags: tagArray.length > 0 ? tagArray : undefined
    };
    
    if (currentTrack) {
      // Update existing track
      const updatedTrack = {
        ...currentTrack,
        ...trackData
      };
      
      const updatedTracks = tracks.map(track => 
        track.id === currentTrack.id ? updatedTrack : track
      );
      
      setTracks(updatedTracks);
      toast.success("Nummer succesvol bijgewerkt");
    } else {
      // Create new track
      const newTrack = createTrack(trackData);
      setTracks([...tracks, newTrack]);
      toast.success("Nieuw nummer succesvol toegevoegd");
    }
    
    setIsTrackDialogOpen(false);
    resetTrackForm();
  };
  
  const handleDeleteTrack = (trackId: string) => {
    // First check if the track is used in any playlist
    const usedInPlaylists = playlists.filter(playlist => 
      playlist.tracks.includes(trackId)
    );
    
    if (usedInPlaylists.length > 0) {
      const playlistNames = usedInPlaylists.map(p => p.name).join(", ");
      toast.error(`Dit nummer kan niet worden verwijderd omdat het wordt gebruikt in de volgende afspeellijsten: ${playlistNames}`);
      return;
    }
    
    setTracks(tracks.filter(track => track.id !== trackId));
    toast.success("Nummer succesvol verwijderd");
  };
  
  // Playlist form handlers
  const resetPlaylistForm = () => {
    setPlaylistFormData({
      name: "",
      description: "",
      coverImageUrl: "",
      tracks: []
    });
    setSelectedTrackIds([]);
  };
  
  const handleOpenNewPlaylist = () => {
    setCurrentPlaylist(null);
    resetPlaylistForm();
    setAvailableTracks(tracks);
    setIsPlaylistDialogOpen(true);
  };
  
  const handleEditPlaylist = (playlist: Playlist) => {
    setCurrentPlaylist(playlist);
    setPlaylistFormData({
      name: playlist.name,
      description: playlist.description || "",
      coverImageUrl: playlist.coverImageUrl || "",
      tracks: playlist.tracks
    });
    setIsPlaylistDialogOpen(true);
  };
  
  const handleSavePlaylist = () => {
    if (!playlistFormData.name) {
      toast.error("Vul de naam van de afspeellijst in");
      return;
    }
    
    const playlistData = {
      name: playlistFormData.name,
      description: playlistFormData.description || undefined,
      coverImageUrl: playlistFormData.coverImageUrl || undefined,
      tracks: selectedTrackIds
    };
    
    if (currentPlaylist) {
      // Update existing playlist
      const updatedPlaylist = {
        ...currentPlaylist,
        ...playlistData,
        trackCount: selectedTrackIds.length,
        updatedAt: new Date().toISOString()
      };
      
      const updatedPlaylists = playlists.map(playlist => 
        playlist.id === currentPlaylist.id ? updatedPlaylist : playlist
      );
      
      setPlaylists(updatedPlaylists);
      toast.success("Afspeellijst succesvol bijgewerkt");
    } else {
      // Create new playlist
      const newPlaylist = createPlaylist(playlistData);
      setPlaylists([...playlists, newPlaylist]);
      toast.success("Nieuwe afspeellijst succesvol aangemaakt");
    }
    
    setIsPlaylistDialogOpen(false);
    resetPlaylistForm();
  };
  
  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter(playlist => playlist.id !== playlistId));
    toast.success("Afspeellijst succesvol verwijderd");
  };
  
  const toggleTrackInPlaylist = (trackId: string) => {
    if (selectedTrackIds.includes(trackId)) {
      setSelectedTrackIds(selectedTrackIds.filter(id => id !== trackId));
    } else {
      setSelectedTrackIds([...selectedTrackIds, trackId]);
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Muziek Beheren</h1>
        </div>
        
        <Tabs defaultValue="tracks" onValueChange={setCurrentTab}>
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="tracks" className="flex items-center gap-2">
              <FileMusic className="h-4 w-4" />
              <span>Nummers</span>
            </TabsTrigger>
            <TabsTrigger value="playlists" className="flex items-center gap-2">
              <ListMusic className="h-4 w-4" />
              <span>Afspeellijsten</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracks" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Nummers</h2>
              <Button onClick={handleOpenNewTrack}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Nieuw Nummer
              </Button>
            </div>
            
            <div className="space-y-2">
              {tracks.map((track) => (
                <Card key={track.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 flex-shrink-0">
                        {track.coverImageUrl ? (
                          <img
                            src={track.coverImageUrl}
                            alt={track.title}
                            className="h-full w-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center rounded-md">
                            <Music className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute -right-2 -bottom-2 h-6 w-6 rounded-full shadow"
                          onClick={() => handlePlayTrack(track.id, track.audioUrl)}
                        >
                          {isPlayingTrack === track.id ? (
                            <Pause className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-base truncate">{track.title}</h3>
                        <p className="text-sm text-muted-foreground">{track.artist}</p>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {formatDuration(track.duration)}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditTrack(track)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteTrack(track.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {tracks.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-4">
                    Er zijn nog geen nummers. Voeg je eerste nummer toe!
                  </p>
                  <Button onClick={handleOpenNewTrack}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Nieuw Nummer
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="playlists" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Afspeellijsten</h2>
              <Button onClick={handleOpenNewPlaylist}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Nieuwe Afspeellijst
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playlists.map((playlist) => (
                <Card key={playlist.id} className="overflow-hidden">
                  <div className="flex h-full">
                    <div className="h-auto w-1/3 relative">
                      {playlist.coverImageUrl ? (
                        <img
                          src={playlist.coverImageUrl}
                          alt={playlist.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center">
                          <ListMusic className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-4 flex-1">
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{playlist.name}</h3>
                          {playlist.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {playlist.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {playlist.trackCount} nummer{playlist.trackCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 px-2"
                              onClick={() => handleEditPlaylist(playlist)}
                            >
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              Bewerken
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeletePlaylist(playlist.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
              
              {playlists.length === 0 && (
                <div className="text-center py-10 col-span-full">
                  <p className="text-muted-foreground mb-4">
                    Er zijn nog geen afspeellijsten. Maak je eerste afspeellijst aan!
                  </p>
                  <Button onClick={handleOpenNewPlaylist}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Nieuwe Afspeellijst
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Track Dialog */}
      <Dialog open={isTrackDialogOpen} onOpenChange={setIsTrackDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentTrack ? "Nummer Bewerken" : "Nieuw Nummer"}
            </DialogTitle>
            <DialogDescription>
              Vul de details in voor het nummer
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                placeholder="Voer de titel in"
                value={trackFormData.title}
                onChange={(e) => setTrackFormData({...trackFormData, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="artist">Artiest *</Label>
              <Input
                id="artist"
                placeholder="Voer de artiest in"
                value={trackFormData.artist}
                onChange={(e) => setTrackFormData({...trackFormData, artist: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="audioUrl">Audio URL *</Label>
              <Input
                id="audioUrl"
                placeholder="https://voorbeeld.com/audio.mp3"
                value={trackFormData.audioUrl}
                onChange={(e) => setTrackFormData({...trackFormData, audioUrl: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="coverImageUrl">Cover Afbeelding URL</Label>
              <Input
                id="coverImageUrl"
                placeholder="https://voorbeeld.com/afbeelding.jpg"
                value={trackFormData.coverImageUrl}
                onChange={(e) => setTrackFormData({...trackFormData, coverImageUrl: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duur (in seconden) *</Label>
              <Input
                id="duration"
                type="number"
                placeholder="180"
                value={trackFormData.duration.toString()}
                onChange={(e) => setTrackFormData({...trackFormData, duration: parseInt(e.target.value) || 0})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="album">Album</Label>
              <Input
                id="album"
                placeholder="Albumnaam"
                value={trackFormData.album}
                onChange={(e) => setTrackFormData({...trackFormData, album: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                placeholder="Ambient, Natuur, etc."
                value={trackFormData.genre}
                onChange={(e) => setTrackFormData({...trackFormData, genre: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (gescheiden door komma's)</Label>
              <Input
                id="tags"
                placeholder="meditatie, natuur, kalmte"
                value={trackFormData.tags}
                onChange={(e) => setTrackFormData({...trackFormData, tags: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTrackDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleSaveTrack}>
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Playlist Dialog */}
      <Dialog open={isPlaylistDialogOpen} onOpenChange={setIsPlaylistDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {currentPlaylist ? "Afspeellijst Bewerken" : "Nieuwe Afspeellijst"}
            </DialogTitle>
            <DialogDescription>
              Vul de details in voor de afspeellijst en selecteer nummers
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Naam *</Label>
                <Input
                  id="name"
                  placeholder="Voer de naam in"
                  value={playlistFormData.name}
                  onChange={(e) => setPlaylistFormData({...playlistFormData, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea
                  id="description"
                  placeholder="Voer een beschrijving in"
                  value={playlistFormData.description}
                  onChange={(e) => setPlaylistFormData({...playlistFormData, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coverImageUrl">Cover Afbeelding URL</Label>
                <Input
                  id="coverImageUrl"
                  placeholder="https://voorbeeld.com/afbeelding.jpg"
                  value={playlistFormData.coverImageUrl}
                  onChange={(e) => setPlaylistFormData({...playlistFormData, coverImageUrl: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Selecteer Nummers</Label>
              <div className="border rounded-md h-64 overflow-y-auto p-2">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center p-2 hover:bg-muted rounded-md cursor-pointer"
                    onClick={() => toggleTrackInPlaylist(track.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTrackIds.includes(track.id)}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{track.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDuration(track.duration)}
                    </div>
                  </div>
                ))}
                
                {tracks.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      Geen nummers beschikbaar
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedTrackIds.length} nummer{selectedTrackIds.length !== 1 ? 's' : ''} geselecteerd
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPlaylistDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleSavePlaylist}>
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMusic;
