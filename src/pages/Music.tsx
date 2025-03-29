
import React, { useEffect } from "react";
import { Tabs } from "@/components/ui/tabs";
import { MobileLayout } from "@/components/mobile-layout";
import { CreatePlaylistDialog } from "@/components/playlist/create-playlist-dialog";

// Hooks
import { useMusicPage } from "@/hooks/use-music-page";
import { useMusicPlayer } from "@/hooks/use-music-player";
import { usePlaylists } from "@/hooks/playlists/use-playlists";
import { useRadioStreams } from "@/hooks/use-radio-streams";

// Components
import { MusicHeader } from "@/components/music/MusicHeader";
import { MusicTabs } from "@/components/music/MusicTabs";
import { MusicContent } from "@/components/music/MusicContent";
import { MusicPlayerContainer } from "@/components/music/MusicPlayerContainer";
import { MusicActionHandlers } from "@/components/music/MusicActionHandlers";
import { MusicBackendControls } from "@/components/music/MusicBackendControls";

const Music = () => {
  // Core music page state
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

  // Music player state
  const {
    currentTrack,
    setCurrentTrack,
    previewTrack,
    isPlaying,
    setIsPlaying,
    audioPlayerRef,
    audioContextRef,
    handlePreviewTrack,
    handleStopPreview,
    currentPlayingTrack
  } = useMusicPlayer();

  // Playlists state
  const {
    playlists,
    selectedPlaylist,
    nextTrack,
    showPlaylistCreator,
    isCrossfading,
    setShowPlaylistCreator,
    handlePlayPlaylist,
    handleStopPlaylist,
    handleAddToPlaylist,
    handleRemoveFromPlaylist,
    handleCreatePlaylist,
    handleTrackEnded,
    handleCrossfadeStart,
    getPlaylistTracks
  } = usePlaylists(musicTracks);

  // Radio streams state
  const {
    radioStreams,
    isLoadingStreams,
    refetchStreams,
    isStreamPlaying,
    hiddenIframeUrl,
    hiddenIframeRef,
    handleStreamPlay,
    handleStreamStop
  } = useRadioStreams();

  // Track whether any audio is active
  useEffect(() => {
    setIsAudioActive(isPlaying || isStreamPlaying);
  }, [isPlaying, isStreamPlaying, setIsAudioActive]);

  // Stop audio handler for general use
  const stopAllAudio = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setCurrentTrack(null);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      }
      
      // Clean up audio context
      if (audioContextRef?.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
    }
    
    if (isStreamPlaying) {
      handleStreamStop();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  return (
    <MobileLayout>
      <div className="space-y-6 pb-32">
        <div className="flex items-center justify-between">
          <MusicHeader />
          
          <MusicBackendControls 
            onRefresh={() => handleReloadPage(refetchStreams, isPlaying, isStreamPlaying, stopAllAudio, handleStreamStop)}
            onClearCache={() => clearAppCache(isPlaying, isStreamPlaying, stopAllAudio, handleStreamStop, refetchStreams)}
            isLoading={isLoading}
          />
        </div>

        <Tabs defaultValue={activeTab} value={activeTab}>
          <MusicTabs activeTab={activeTab} onTabChange={handleTabChange} />
          
          <MusicActionHandlers
            handlePlayPlaylist={handlePlayPlaylist}
            handleStopPlaylist={handleStopPlaylist}
            handleRemoveFromPlaylist={handleRemoveFromPlaylist}
            setCurrentTrack={setCurrentTrack}
            setIsPlaying={setIsPlaying}
            handleStreamStop={handleStreamStop}
          >
            {({ handlePlaylistPlay, handlePlaylistStop, handleTrackRemove }) => (
              <MusicContent 
                activeTab={activeTab}
                musicTracks={musicTracks}
                playlists={playlists}
                selectedPlaylist={selectedPlaylist}
                isPlaying={isPlaying}
                currentTrack={currentTrack}
                previewTrack={previewTrack}
                radioStreams={radioStreams}
                isLoadingStreams={isLoadingStreams}
                hiddenIframeUrl={hiddenIframeUrl}
                setShowPlaylistCreator={setShowPlaylistCreator}
                handlePreviewTrack={handlePreviewTrack}
                handleAddToPlaylist={handleAddToPlaylist}
                handlePlayPlaylist={handlePlaylistPlay}
                handleStopPlaylist={handlePlaylistStop}
                handleRemoveFromPlaylist={handleTrackRemove}
                handleStreamPlay={handleStreamPlay}
                handleStreamStop={handleStreamStop}
                getPlaylistTracks={getPlaylistTracks}
              />
            )}
          </MusicActionHandlers>
        </Tabs>
      </div>
      
      {/* Player components */}
      <MusicPlayerContainer
        isPlaying={isPlaying}
        currentPlayingTrack={currentPlayingTrack}
        selectedPlaylist={selectedPlaylist}
        nextTrack={nextTrack}
        isStreamPlaying={isStreamPlaying}
        hiddenIframeUrl={hiddenIframeUrl}
        hiddenIframeRef={hiddenIframeRef}
        audioPlayerRef={audioPlayerRef}
        audioContextRef={audioContextRef}
        handleStopPreview={handleStopPreview}
        handleTrackEnded={handleTrackEnded}
        handleCrossfadeStart={handleCrossfadeStart}
        handleStreamStop={handleStreamStop}
        setIsPlaying={setIsPlaying}
        setCurrentTrack={setCurrentTrack}
        previewTrack={previewTrack}
      />
      
      {/* Playlist creator dialog */}
      <CreatePlaylistDialog
        open={showPlaylistCreator}
        onOpenChange={setShowPlaylistCreator}
        onSubmit={handleCreatePlaylist}
      />
    </MobileLayout>
  );
};

export default Music;
