
import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MusicPlayer } from "@/components/music-player";
import { fetchMusicItems, fetchPlaylists } from "@/services/musicService";
import { MusicItem, Playlist } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Music as MusicIcon, Search, ListMusic, Play, Clock } from "lucide-react";

const Music = () => {
  const [musicItems, setMusicItems] = useState<MusicItem[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<MusicItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch music data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch music and playlists
        const [musicData, playlistsData] = await Promise.all([
          fetchMusicItems(),
          fetchPlaylists()
        ]);
        
        setMusicItems(musicData);
        setPlaylists(playlistsData);
        
        // Set initial track
        if (musicData.length > 0 && !selectedTrack) {
          setSelectedTrack(musicData[0]);
        }
      } catch (error) {
        console.error("Error loading music data:", error);
        toast({
          title: "Error",
          description: "Failed to load music data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Filter music based on search and selected tab
  const filteredMusic = musicItems.filter(item => {
    const matchesSearch = searchQuery 
      ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.artist.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesTab = selectedTab === "all" ? true : item.category === selectedTab;
    
    return matchesSearch && matchesTab;
  });
  
  // Get unique categories for tabs
  const categories = Array.from(new Set(musicItems.map(item => item.category))).filter(Boolean);
  
  // Handle track selection
  const handleTrackSelect = (track: MusicItem) => {
    setSelectedTrack(track);
    setSelectedPlaylist(null);
  };
  
  // Handle playlist selection
  const handlePlaylistSelect = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    if (playlist.tracks.length > 0) {
      setSelectedTrack(playlist.tracks[0]);
    }
  };
  
  // Get tracks for the player
  const getPlayerTracks = () => {
    if (selectedPlaylist) {
      return selectedPlaylist.tracks;
    }
    
    if (selectedTab === "all") {
      return filteredMusic;
    }
    
    return musicItems.filter(item => item.category === selectedTab);
  };
  
  return (
    <MobileLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Muziek</h1>
          <MusicIcon className="h-6 w-6 text-primary" />
        </div>
        
        <p className="text-muted-foreground">
          Ontdek rustgevende muziek en natuurgeluiden
        </p>
        
        {/* Music Player */}
        <Card className="neo-morphism mb-6">
          <CardContent className="p-0">
            <MusicPlayer 
              tracks={getPlayerTracks()} 
              initialTrack={selectedTrack || undefined}
              autoPlay={false}
            />
          </CardContent>
        </Card>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Zoek muziek..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Music Categories */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="w-full overflow-x-auto flex whitespace-nowrap py-1 px-0 h-auto justify-start">
            <TabsTrigger value="all" className="rounded-full">Alles</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger 
                key={category} 
                value={category} 
                className="rounded-full"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all">
            {/* Playlists Section */}
            {playlists.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <ListMusic className="h-5 w-5 text-primary" />
                  <span>Afspeellijsten</span>
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {playlists.map(playlist => (
                    <Card 
                      key={playlist.id}
                      className={`hover-scale cursor-pointer ${selectedPlaylist?.id === playlist.id ? 'border-primary' : ''}`}
                      onClick={() => handlePlaylistSelect(playlist)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="w-full aspect-square rounded-md bg-muted flex items-center justify-center overflow-hidden">
                          {playlist.coverImageUrl ? (
                            <img 
                              src={playlist.coverImageUrl} 
                              alt={playlist.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ListMusic className="h-12 w-12 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm truncate">{playlist.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {playlist.tracks.length} nummers
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* All Music Section */}
            <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
              <MusicIcon className="h-5 w-5 text-primary" />
              <span>Alle muziek</span>
            </h2>
          </TabsContent>
          
          {/* Tracks List */}
          <div className="space-y-2 mt-4">
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Laden...</p>
            ) : filteredMusic.length > 0 ? (
              filteredMusic.map(track => (
                <div 
                  key={track.id}
                  className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedTrack?.id === track.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => handleTrackSelect(track)}
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center relative group">
                    {track.coverImageUrl ? (
                      <img 
                        src={track.coverImageUrl} 
                        alt={track.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MusicIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{track.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {track.duration 
                        ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`
                        : "?:??"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                {searchQuery 
                  ? "Geen resultaten gevonden. Pas je zoekopdracht aan."
                  : "Geen muziek gevonden in deze categorie."}
              </p>
            )}
          </div>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default Music;
