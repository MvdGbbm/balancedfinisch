
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MusicTracks } from "./music-tracks";
import { PlaylistsTab } from "./playlists-tab";
import { RadioStreamsTab } from "./radio-streams-tab";
import { Soundscape } from "@/lib/types";
import { Playlist } from "@/components/playlist/types";
import { RadioStream } from "./types";

interface MusicPageTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  musicTracks: Soundscape[];
  playlists: Playlist[];
  radioStreams: RadioStream[];
  isLoadingStreams: boolean;
  isPlaying: boolean;
  previewTrack: Soundscape | null;
  currentTrack: Soundscape | null;
  selectedPlaylist: Playlist | null;
  hiddenIframeUrl: string | null;
  onPlayTrack: (track: Soundscape) => void;
  onAddToPlaylist: (track: Soundscape, playlist: Playlist) => void;
  onCreatePlaylist: () => void;
  onToggleFavorite: (track: Soundscape) => void;
  onPlayPlaylist: (playlist: Playlist) => void;
  onStopPlaylist: () => void;
  onRemoveFromPlaylist: (trackId: string, playlistId: string) => void;
  onStreamPlay: (stream: RadioStream) => void;
  onStreamStop: () => void;
}

export const MusicPageTabs: React.FC<MusicPageTabsProps> = ({
  activeTab,
  onTabChange,
  musicTracks,
  playlists,
  radioStreams,
  isLoadingStreams,
  isPlaying,
  previewTrack,
  currentTrack,
  selectedPlaylist,
  hiddenIframeUrl,
  onPlayTrack,
  onAddToPlaylist,
  onCreatePlaylist,
  onToggleFavorite,
  onPlayPlaylist,
  onStopPlaylist,
  onRemoveFromPlaylist,
  onStreamPlay,
  onStreamStop,
}) => {
  return (
    <Tabs defaultValue="music" value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid grid-cols-3 mb-4 sticky top-0 z-30 bg-background">
        <TabsTrigger value="music">Muziek</TabsTrigger>
        <TabsTrigger value="playlists">Afspeellijsten</TabsTrigger>
        <TabsTrigger value="radio">Streaming</TabsTrigger>
      </TabsList>
      
      <TabsContent value="music" className="space-y-4">
        <MusicTracks 
          tracks={musicTracks}
          isPlaying={isPlaying}
          previewTrack={previewTrack}
          currentTrack={currentTrack}
          onPlayTrack={onPlayTrack}
          onAddToPlaylist={onAddToPlaylist}
          onToggleFavorite={onToggleFavorite}
          playlists={playlists}
          onCreatePlaylist={onCreatePlaylist}
        />
      </TabsContent>
      
      <TabsContent value="playlists" className="space-y-4">
        <PlaylistsTab
          playlists={playlists}
          selectedPlaylist={selectedPlaylist}
          isPlaying={isPlaying}
          currentTrack={currentTrack}
          onPlayPlaylist={onPlayPlaylist}
          onStopPlaylist={onStopPlaylist}
          onRemoveFromPlaylist={onRemoveFromPlaylist}
          onCreatePlaylist={onCreatePlaylist}
          musicTracks={musicTracks}
        />
      </TabsContent>
      
      <TabsContent value="radio" className="space-y-4">
        <RadioStreamsTab
          streams={radioStreams}
          isLoadingStreams={isLoadingStreams}
          hiddenIframeUrl={hiddenIframeUrl}
          onStreamPlay={onStreamPlay}
          onStreamStop={onStreamStop}
        />
      </TabsContent>
    </Tabs>
  );
};
