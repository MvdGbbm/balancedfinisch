
import React, { useState } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Music as MusicIcon, 
  Heart, 
  ListMusic, 
  Radio, 
  Shuffle, 
  Plus, 
  Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/context/AppContext";
import { PlaylistSelector } from "@/components/playlist/playlist-selector";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Soundscape } from "@/lib/types";
import { RadioStream } from "@/components/music/types";
import { Playlist } from "@/components/playlist/types";

const Music: React.FC = () => {
  const { soundscapes } = useApp();
  const [activeTab, setActiveTab] = useState("muziek");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Placeholder playlists data
  const playlists: Playlist[] = [
    {
      id: "1",
      name: "Mijn favorieten",
      tracks: [],
      createdAt: new Date().toISOString()
    },
    {
      id: "2",
      name: "Ontspanning",
      tracks: [],
      createdAt: new Date().toISOString()
    }
  ];
  
  // Placeholder radio streams data
  const radioStreams: RadioStream[] = [
    {
      id: "1",
      title: "Lofi Beats",
      url: "https://example.com/stream/lofi",
      description: "Ontspannende lofi beats",
      is_active: true,
      position: 1
    },
    {
      id: "2",
      title: "Classical Music",
      url: "https://example.com/stream/classical",
      description: "Klassieke muziek voor concentratie",
      is_active: true,
      position: 2
    }
  ];
  
  // Filter music tracks
  const musicTracks = soundscapes.filter(track => track.category === "Muziek");
  
  // Filter by selected category
  const filteredMusicTracks = selectedCategory === "all" 
    ? musicTracks 
    : musicTracks.filter(track => track.tags?.includes(selectedCategory));
  
  // Placeholder favorites
  const favoritesTracks = musicTracks.filter(track => track.isFavorite);
  
  // Get unique categories from tracks
  const categories = Array.from(
    new Set(musicTracks.flatMap(track => track.tags || []))
  );
  
  const handleAddToPlaylist = (track: Soundscape, playlist: Playlist) => {
    // Implementation would be added here
    console.log(`Adding track ${track.title} to playlist ${playlist.name}`);
  };
  
  const handleShuffleMusic = () => {
    // Implementation would be added here
    console.log("Shuffle music");
  };
  
  const handleRemoveTrack = (track: Soundscape) => {
    // Implementation would be added here
    console.log(`Removing track ${track.title}`);
  };
  
  const handlePlaylistCreation = () => {
    // Implementation would be added here
    console.log("Creating new playlist");
  };

  const renderTrackCard = (track: Soundscape, showFavoriteControls: boolean = false) => (
    <Card key={track.id} className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded bg-cover bg-center flex-shrink-0" 
            style={{ backgroundImage: `url(${track.coverImageUrl})` }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{track.title}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {track.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PlaylistSelector 
              playlists={playlists}
              onSelectPlaylist={(playlist) => handleAddToPlaylist(track, playlist)}
              onCreateNew={handlePlaylistCreation}
            />
            
            {showFavoriteControls && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleRemoveTrack(track)}
                className="text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MobileLayout
      title="Muziek"
      icon={<MusicIcon className="h-5 w-5" />}
      showNav={true}
    >
      <div className="container px-4 pb-20">
        <Tabs 
          defaultValue="muziek" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="muziek" className="text-xs">
              <MusicIcon className="h-4 w-4 mr-1" />
              Muziek
            </TabsTrigger>
            <TabsTrigger value="favourieten" className="text-xs">
              <Heart className="h-4 w-4 mr-1" />
              Favourieten
            </TabsTrigger>
            <TabsTrigger value="afspeellijsten" className="text-xs">
              <ListMusic className="h-4 w-4 mr-1" />
              Afspeellijsten
            </TabsTrigger>
            <TabsTrigger value="streaming" className="text-xs">
              <Radio className="h-4 w-4 mr-1" />
              Streaming
            </TabsTrigger>
          </TabsList>
          
          {/* Muziek tab content */}
          <TabsContent value="muziek" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Categorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle categorieën</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={handleShuffleMusic}>
                <Shuffle className="h-4 w-4 mr-1" />
                Shuffle
              </Button>
            </div>
            
            <div className="space-y-2">
              {filteredMusicTracks.length > 0 ? (
                filteredMusicTracks.map(track => renderTrackCard(track))
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Geen muziek gevonden in deze categorie
                </p>
              )}
            </div>
          </TabsContent>
          
          {/* Favourieten tab content */}
          <TabsContent value="favourieten" className="space-y-4">
            <div className="flex justify-end items-center mb-4">
              <Button variant="outline" size="sm" onClick={handleShuffleMusic}>
                <Shuffle className="h-4 w-4 mr-1" />
                Shuffle
              </Button>
            </div>
            
            <div className="space-y-2">
              {favoritesTracks.length > 0 ? (
                favoritesTracks.map(track => renderTrackCard(track, true))
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Geen favorieten gevonden
                </p>
              )}
            </div>
          </TabsContent>
          
          {/* Afspeellijsten tab content */}
          <TabsContent value="afspeellijsten" className="space-y-4">
            <div className="flex justify-end items-center mb-4">
              <Button variant="outline" size="sm" onClick={handlePlaylistCreation}>
                <Plus className="h-4 w-4 mr-1" />
                Nieuwe afspeellijst
              </Button>
            </div>
            
            <div className="space-y-2">
              {playlists.length > 0 ? (
                playlists.map(playlist => (
                  <Card key={playlist.id} className="mb-3">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-primary/10 flex-shrink-0 flex items-center justify-center">
                          <ListMusic className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{playlist.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {playlist.tracks.length} nummers
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Geen afspeellijsten gevonden
                </p>
              )}
            </div>
          </TabsContent>
          
          {/* Streaming tab content */}
          <TabsContent value="streaming" className="space-y-4">
            <div className="space-y-2">
              {radioStreams.length > 0 ? (
                radioStreams.map(stream => (
                  <Card key={stream.id} className="mb-3">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-primary/10 flex-shrink-0 flex items-center justify-center">
                          <Radio className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{stream.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {stream.description}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Afspelen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Geen streaming links gevonden
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default Music;
