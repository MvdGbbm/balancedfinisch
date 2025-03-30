
import React, { useState } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music as MusicIcon, Heart, ListMusic, Radio } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Soundscape } from "@/lib/types";
import { Playlist } from "@/components/playlist/types";
import { MusicTab } from "@/components/music/MusicTab";
import { FavoritesTab } from "@/components/music/FavoritesTab";
import { PlaylistsTab } from "@/components/music/PlaylistsTab";
import { StreamingTab } from "@/components/music/StreamingTab";

const Music: React.FC = () => {
  const { soundscapes } = useApp();
  const [activeTab, setActiveTab] = useState("muziek");
  
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
  const radioStreams = [
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

  return (
    <MobileLayout
      showNav={true}
    >
      <div className="container px-4 pb-20">
        <div className="flex items-center gap-2 mb-4">
          <MusicIcon className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Muziek</h1>
        </div>
        
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
          <TabsContent value="muziek">
            <MusicTab 
              musicTracks={musicTracks}
              categories={categories}
              onShuffleMusic={handleShuffleMusic}
              onAddToPlaylist={handleAddToPlaylist}
              onPlaylistCreation={handlePlaylistCreation}
            />
          </TabsContent>
          
          {/* Favourieten tab content */}
          <TabsContent value="favourieten">
            <FavoritesTab 
              favoritesTracks={favoritesTracks}
              onShuffleMusic={handleShuffleMusic}
              onAddToPlaylist={handleAddToPlaylist}
              onRemoveTrack={handleRemoveTrack}
              onPlaylistCreation={handlePlaylistCreation}
            />
          </TabsContent>
          
          {/* Afspeellijsten tab content */}
          <TabsContent value="afspeellijsten">
            <PlaylistsTab 
              playlists={playlists}
              onPlaylistCreation={handlePlaylistCreation}
            />
          </TabsContent>
          
          {/* Streaming tab content */}
          <TabsContent value="streaming">
            <StreamingTab 
              radioStreams={radioStreams}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default Music;
