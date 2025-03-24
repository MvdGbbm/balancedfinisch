import React, { useState, useEffect, useRef } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { TabView } from "@/components/music/tab-view";
import { MusicPlayer } from "@/components/music/music-player";
import { PlaylistCard } from "@/components/music/playlist-card";
import { TrackItem } from "@/components/music/track-item";
import { AudioVisualizer } from "@/components/music/audio-visualizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ListMusic, 
  Disc,
  Music as MusicIcon,
  Search,
  PlusCircle,
  Play
} from "lucide-react";
import { Track, Playlist } from "@/lib/types";
import { tracks, playlists, getTracksForPlaylist } from "@/data/music";

const Music: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTracks, setFilteredTracks] = useState<Track[]>(tracks);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [activeTab, setActiveTab] = useState("playlists");
  
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTracks(tracks);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredTracks(
        tracks.filter(
          (track) =>
            track.title.toLowerCase().includes(query) ||
            track.artist.toLowerCase().includes(query) ||
            (track.album && track.album.toLowerCase().includes(query)) ||
            (track.genre && track.genre.toLowerCase().includes(query)) ||
            track.tags?.some((tag) => tag.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery]);
  
  useEffect(() => {
    if (selectedPlaylist) {
      const tracks = getTracksForPlaylist(selectedPlaylist.id);
      setPlaylistTracks(tracks);
    } else {
      setPlaylistTracks([]);
    }
  }, [selectedPlaylist]);
  
  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    
    if (selectedPlaylist) {
      const tracks = getTracksForPlaylist(selectedPlaylist.id);
      setQueue(tracks);
      setQueueIndex(tracks.findIndex(t => t.id === track.id));
    } else {
      setQueue([track]);
      setQueueIndex(0);
    }
  };
  
  const handlePlayPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    
    const tracks = getTracksForPlaylist(playlist.id);
    if (tracks.length > 0) {
      setQueue(tracks);
      setQueueIndex(0);
      setCurrentTrack(tracks[0]);
      setIsPlaying(true);
    }
  };
  
  const handleNext = () => {
    if (queue.length === 0) return;
    
    let nextIndex;
    
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
      if (queue.length > 1) {
        while (nextIndex === queueIndex) {
          nextIndex = Math.floor(Math.random() * queue.length);
        }
      }
    } else {
      nextIndex = (queueIndex + 1) % queue.length;
    }
    
    setQueueIndex(nextIndex);
    setCurrentTrack(queue[nextIndex]);
    setIsPlaying(true);
  };
  
  const handlePrevious = () => {
    if (queue.length === 0) return;
    
    let prevIndex;
    
    if (isShuffle) {
      prevIndex = Math.floor(Math.random() * queue.length);
      if (queue.length > 1) {
        while (prevIndex === queueIndex) {
          prevIndex = Math.floor(Math.random() * queue.length);
        }
      }
    } else {
      prevIndex = queueIndex === 0 ? queue.length - 1 : queueIndex - 1;
    }
    
    setQueueIndex(prevIndex);
    setCurrentTrack(queue[prevIndex]);
    setIsPlaying(true);
  };
  
  const handleBackToPlaylists = () => {
    setSelectedPlaylist(null);
  };
  
  const playlistsTabContent = (
    <div className="space-y-4">
      {selectedPlaylist ? (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBackToPlaylists}
            >
              ← Terug
            </Button>
            <h2 className="text-xl font-semibold">{selectedPlaylist.name}</h2>
          </div>
          
          {selectedPlaylist.description && (
            <p className="text-muted-foreground">{selectedPlaylist.description}</p>
          )}
          
          <div className="flex flex-col gap-2 pb-32">
            {playlistTracks.length > 0 ? (
              playlistTracks.map((track) => (
                <TrackItem
                  key={track.id}
                  track={track}
                  isPlaying={isPlaying && currentTrack?.id === track.id}
                  isActive={currentTrack?.id === track.id}
                  onPlay={() => handlePlayTrack(track)}
                  onPause={() => setIsPlaying(false)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Geen nummers gevonden in deze afspeellijst.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-32">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onSelect={handlePlayPlaylist}
            />
          ))}
        </div>
      )}
    </div>
  );
  
  const libraryTabContent = (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 bg-background pb-2">
        <Input
          placeholder="Zoek muziek..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
          prefix={<Search className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      
      <div className="flex flex-col gap-2 pb-32">
        {filteredTracks.length > 0 ? (
          filteredTracks.map((track) => (
            <TrackItem
              key={track.id}
              track={track}
              isPlaying={isPlaying && currentTrack?.id === track.id}
              isActive={currentTrack?.id === track.id}
              onPlay={() => handlePlayTrack(track)}
              onPause={() => setIsPlaying(false)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Geen nummers gevonden die overeenkomen met je zoekopdracht.</p>
          </div>
        )}
      </div>
    </div>
  );
  
  const visualizerTabContent = (
    <div className="space-y-4 pb-32">
      <AudioVisualizer audioElement={audioElement} />
    </div>
  );
  
  return (
    <MobileLayout>
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-2xl font-bold">Muziek</h1>
        
        <TabView
          tabs={[
            {
              value: "playlists",
              label: "Afspeellijsten",
              content: playlistsTabContent,
            },
            {
              value: "library",
              label: "Bibliotheek",
              content: libraryTabContent,
            },
            {
              value: "visualizer",
              label: "Equalizer",
              content: visualizerTabContent,
            },
          ]}
          defaultValue="playlists"
        />
      </div>
      
      {currentTrack && (
        <div className="fixed bottom-16 left-0 right-0 z-50 px-4">
          <MusicPlayer
            track={currentTrack}
            isPlaying={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onToggleRepeat={() => setIsRepeat(!isRepeat)}
            onToggleShuffle={() => setIsShuffle(!isShuffle)}
            isRepeat={isRepeat}
            isShuffle={isShuffle}
            className="glass-morphism shadow-lg animate-slide-in-right"
            onAudioElementReady={setAudioElement}
          />
        </div>
      )}
    </MobileLayout>
  );
};

export default Music;
