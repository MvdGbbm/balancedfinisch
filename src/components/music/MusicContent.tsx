
import React from "react";
import { MusicTabContent } from "./MusicTabContent";
import { PlaylistTabContent } from "./PlaylistTabContent";
import { RadioTabContent } from "./RadioTabContent";
import { LoadingContent } from "./LoadingContent";
import { TabsContent } from "@/components/ui/tabs";
import { Soundscape } from "@/lib/types";
import { Playlist } from "@/components/playlist/types";

interface MusicContentProps {
  activeTab: string;
  musicTracks: Soundscape[];
  playlists: Playlist[];
  selectedPlaylist: Playlist | null;
  isPlaying: boolean;
  currentTrack: Soundscape | null;
  previewTrack: Soundscape | null;
  radioStreams: any[];
  isLoadingStreams: boolean;
  hiddenIframeUrl: string | null;
  setShowPlaylistCreator: (show: boolean) => void;
  handlePreviewTrack: (track: Soundscape) => void;
  handleAddToPlaylist: (track: Soundscape, playlistId: string) => void;
  handlePlayPlaylist: (playlist: Playlist) => void;
  handleStopPlaylist: () => void;
  handleRemoveFromPlaylist: (trackId: string, playlistId: string) => void;
  handleStreamPlay: (stream: any) => void;
  handleStreamStop: () => void;
  getPlaylistTracks: (playlist: Playlist) => Soundscape[];
}

export const MusicContent: React.FC<MusicContentProps> = ({
  activeTab,
  musicTracks,
  playlists,
  selectedPlaylist,
  isPlaying,
  currentTrack,
  previewTrack,
  radioStreams,
  isLoadingStreams,
  hiddenIframeUrl,
  setShowPlaylistCreator,
  handlePreviewTrack,
  handleAddToPlaylist,
  handlePlayPlaylist,
  handleStopPlaylist,
  handleRemoveFromPlaylist,
  handleStreamPlay,
  handleStreamStop,
  getPlaylistTracks
}) => {
  if (activeTab === "music" && musicTracks.length === 0) {
    return <LoadingContent message="Muziek laden..." />;
  }

  if (activeTab === "playlists" && playlists.length === 0) {
    return <LoadingContent message="Geen afspeellijsten gevonden" />;
  }

  if (activeTab === "streaming" && isLoadingStreams) {
    return <LoadingContent message="Radio streams laden..." />;
  }

  return (
    <>
      <TabsContent value="music" className="mt-6 space-y-4 animate-fade-in">
        <MusicTabContent 
          tracks={musicTracks}
          playlists={playlists}
          onPreviewTrack={handlePreviewTrack}
          onAddToPlaylist={handleAddToPlaylist}
          isPlaying={isPlaying}
          currentTrack={currentTrack}
          previewTrack={previewTrack}
        />
      </TabsContent>
      
      <TabsContent value="playlists" className="mt-6 space-y-4 animate-fade-in">
        <PlaylistTabContent 
          playlists={playlists}
          selectedPlaylist={selectedPlaylist}
          isPlaying={isPlaying}
          currentTrack={currentTrack}
          onCreatePlaylist={() => setShowPlaylistCreator(true)}
          onPlayPlaylist={handlePlayPlaylist}
          onStopPlaylist={handleStopPlaylist}
          onRemoveTrack={handleRemoveFromPlaylist}
          getPlaylistTracks={getPlaylistTracks}
        />
      </TabsContent>
      
      <TabsContent value="streaming" className="mt-6 space-y-4 animate-fade-in">
        <RadioTabContent 
          streams={radioStreams}
          isStreamPlaying={!!hiddenIframeUrl}
          onStreamPlay={handleStreamPlay}
          onStreamStop={handleStreamStop}
        />
      </TabsContent>
    </>
  );
};
