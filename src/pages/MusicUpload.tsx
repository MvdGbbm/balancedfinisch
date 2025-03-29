
import React, { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/context/AppContext";
import { useMusicPage } from "@/hooks/use-music-page";
import { useRadioStreams } from "@/hooks/use-radio-streams";
import { useMusicPlayer } from "@/hooks/use-music-player";
import { usePlaylists } from "@/hooks/playlists/use-playlists";
import { MusicHeader } from "@/components/music/MusicHeader";
import { MusicBackendControls } from "@/components/music/MusicBackendControls";
import { MusicTabs } from "@/components/music/MusicTabs";
import { MusicContent } from "@/components/music/MusicContent";
import { CreatePlaylistDialog } from "@/components/playlist/create-playlist-dialog";
import { MusicUploadPanel } from "@/components/music-upload/MusicUploadPanel";
import { PlaylistPanel } from "@/components/music-upload/PlaylistPanel";
import { StreamingPanel } from "@/components/music-upload/StreamingPanel";

export default function MusicUpload() {
  const { soundscapes } = useApp();
  const musicPlayer = useMusicPlayer();
  const { 
    musicTracks, 
    activeTab, 
    isLoading, 
    isAudioActive,
    setIsAudioActive,
    handleTabChange,
    handleReloadPage,
    clearAppCache
  } = useMusicPage();
  
  const {
    radioStreams,
    isLoadingStreams,
    refetchStreams,
    isStreamPlaying,
    streamUrl,
    streamTitle,
    hiddenIframeUrl,
    hiddenIframeRef,
    handleStreamPlay,
    handleStreamStop
  } = useRadioStreams();
  
  const playlists = usePlaylists(soundscapes);
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col gap-6">
        {/* Header met besturingselementen */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Muziek Upload</h1>
          
          <MusicBackendControls 
            onRefresh={() => handleReloadPage(
              refetchStreams,
              musicPlayer.isPlaying,
              isStreamPlaying,
              musicPlayer.stopAudio,
              handleStreamStop
            )}
            onClearCache={() => clearAppCache(
              musicPlayer.isPlaying,
              isStreamPlaying,
              musicPlayer.stopAudio,
              handleStreamStop,
              refetchStreams
            )}
            isLoading={isLoading}
          />
        </div>
        
        {/* Tabs */}
        <Tabs 
          defaultValue="muziek" 
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="mb-6 w-full max-w-md mx-auto grid grid-cols-3">
            <TabsTrigger value="muziek">Muziek</TabsTrigger>
            <TabsTrigger value="afspeellijsten">Afspeellijsten</TabsTrigger>
            <TabsTrigger value="streaming">Streaming</TabsTrigger>
          </TabsList>
          
          <TabsContent value="muziek" className="mt-4">
            <MusicUploadPanel />
          </TabsContent>
          
          <TabsContent value="afspeellijsten" className="mt-4">
            <PlaylistPanel
              playlists={playlists.playlists}
              musicTracks={musicTracks}
              selectedPlaylist={playlists.selectedPlaylist}
              handlePlayPlaylist={(playlist) => playlists.handlePlayPlaylist(
                playlist,
                handleStreamStop,
                musicPlayer.setCurrentTrack,
                musicPlayer.setIsPlaying
              )}
              handleAddToPlaylist={playlists.handleAddToPlaylist}
              handleRemoveFromPlaylist={(trackId, playlistId) => playlists.handleRemoveFromPlaylist(
                trackId,
                playlistId,
                musicPlayer.setCurrentTrack,
                musicPlayer.setIsPlaying
              )}
              handleCreatePlaylist={playlists.handleCreatePlaylist}
              setShowPlaylistCreator={playlists.setShowPlaylistCreator}
              showPlaylistCreator={playlists.showPlaylistCreator}
              getPlaylistTracks={playlists.getPlaylistTracks}
            />
          </TabsContent>
          
          <TabsContent value="streaming" className="mt-4">
            <StreamingPanel
              radioStreams={radioStreams}
              isLoadingStreams={isLoadingStreams}
              isStreamPlaying={isStreamPlaying}
              streamUrl={streamUrl}
              streamTitle={streamTitle}
              handleStreamPlay={handleStreamPlay}
              handleStreamStop={handleStreamStop}
            />
          </TabsContent>
        </Tabs>
        
        {hiddenIframeUrl && (
          <iframe 
            ref={hiddenIframeRef}
            src={hiddenIframeUrl} 
            style={{ display: "none" }} 
            title="Hidden Stream Player"
          />
        )}
        
        {/* Dialoog voor het maken van afspeellijsten */}
        <CreatePlaylistDialog 
          open={playlists.showPlaylistCreator} 
          onOpenChange={playlists.setShowPlaylistCreator}
          onCreatePlaylist={playlists.handleCreatePlaylist}
        />
      </div>
    </div>
  );
}
