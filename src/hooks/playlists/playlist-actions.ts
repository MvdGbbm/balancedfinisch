
import { Playlist } from "@/components/playlist/types";
import { Soundscape } from "@/lib/types";
import { useToast } from "../use-toast";
import { findTrackById, getNextTrackIndex, isTrackInPlaylist, createNewPlaylist } from "./playlist-utils";

export function usePlaylistActions(
  soundscapes: Soundscape[],
  playlists: Playlist[],
  setPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>,
  selectedPlaylist: Playlist | null,
  setSelectedPlaylist: React.Dispatch<React.SetStateAction<Playlist | null>>,
  currentTrackIndex: number,
  setCurrentTrackIndex: React.Dispatch<React.SetStateAction<number>>,
  setShowPlaylistCreator: React.Dispatch<React.SetStateAction<boolean>>,
  setIsCrossfading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const { toast } = useToast();

  const handlePlayPlaylist = (
    playlist: Playlist, 
    onStreamStop: () => void, 
    setCurrentTrack: (track: Soundscape | null) => void, 
    setIsPlaying: (isPlaying: boolean) => void
  ) => {
    if (playlist.tracks.length === 0) {
      toast({
        title: "Lege afspeellijst",
        description: "Deze afspeellijst bevat geen nummers.",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedPlaylist?.id === playlist.id) {
      handleStopPlaylist(setCurrentTrack, setIsPlaying);
      return;
    }
    
    // Stop any stream if playing
    onStreamStop();
    
    setSelectedPlaylist(playlist);
    setCurrentTrackIndex(0);
    
    const firstTrackId = playlist.tracks[0].trackId;
    const track = findTrackById(soundscapes, firstTrackId);
    setCurrentTrack(track);
    setIsPlaying(true);
    
    toast({
      title: "Afspeellijst gestart",
      description: `${playlist.name} wordt nu afgespeeld`
    });
  };
  
  const handleStopPlaylist = (
    setCurrentTrack: (track: Soundscape | null) => void, 
    setIsPlaying: (isPlaying: boolean) => void
  ) => {
    setIsPlaying(false);
    setSelectedPlaylist(null);
    setCurrentTrack(null);
    
    toast({
      title: "Afspeellijst gestopt",
      description: "De afspeellijst is gestopt met afspelen"
    });
  };

  const handleAddToPlaylist = (track: Soundscape, playlist: Playlist) => {
    if (isTrackInPlaylist(playlist, track.id)) {
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
      description: `${track.title} is toegevoegd aan ${playlist.name}`
    });
  };

  const handleRemoveFromPlaylist = (
    trackId: string, 
    playlistId: string, 
    setCurrentTrack: (track: Soundscape | null) => void,
    setIsPlaying: (isPlaying: boolean) => void
  ) => {
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
          const newTrack = findTrackById(soundscapes, newTrackId);
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
    const newPlaylist = createNewPlaylist(name);
    
    setPlaylists([...playlists, newPlaylist]);
    setShowPlaylistCreator(false);
    
    toast({
      title: "Afspeellijst aangemaakt",
      description: `Afspeellijst '${name}' is aangemaakt`,
    });
  };

  const handleTrackEnded = () => {
    console.info("Track ended callback");
    
    if (selectedPlaylist && selectedPlaylist.tracks.length > 0) {
      const nextIndex = getNextTrackIndex(currentTrackIndex, selectedPlaylist.tracks.length);
      setCurrentTrackIndex(nextIndex);
      
      const nextTrackId = selectedPlaylist.tracks[nextIndex].trackId;
      const nextTrackObj = findTrackById(soundscapes, nextTrackId);
      
      if (nextTrackObj) {
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

  return {
    handlePlayPlaylist,
    handleStopPlaylist,
    handleAddToPlaylist,
    handleRemoveFromPlaylist,
    handleCreatePlaylist,
    handleTrackEnded,
    handleCrossfadeStart
  };
}
