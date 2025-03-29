
import React, { useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MobileLayout } from "@/components/mobile-layout";
import { CreatePlaylistDialog } from "@/components/playlist/create-playlist-dialog";

// Hooks
import { useMusicPage } from "@/hooks/use-music-page";
import { useMusicPlayer } from "@/hooks/use-music-player";
import { usePlaylists } from "@/hooks/use-playlists";
import { useRadioStreams } from "@/hooks/use-radio-streams";

// Components
import { MusicHeader } from "@/components/music/MusicHeader";
import { MusicTabs } from "@/components/music/MusicTabs";
import { MusicTrackCard } from "@/components/music/MusicTrackCard";
import { PlaylistCard } from "@/components/music/PlaylistCard";
import { RadioStreamCard } from "@/components/music/RadioStreamCard";
import { MusicPlayer } from "@/components/music/MusicPlayer";
import { RadioPlayer } from "@/components/music/RadioPlayer";

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
      setCurrentTrack(null);
      setIsPlaying(false);
    }
    if (isStreamPlaying) {
      handleStreamStop();
    }
  };

  const shouldShowPlayer = isPlaying || isStreamPlaying || hiddenIframeUrl;

  return (
    <MobileLayout>
      <div className="space-y-6 pb-32">
        <MusicHeader 
          onRefresh={() => handleReloadPage(refetchStreams, isPlaying, isStreamPlaying, stopAllAudio, handleStreamStop)}
          onClearCache={() => clearAppCache(isPlaying, isStreamPlaying, stopAllAudio, handleStreamStop, refetchStreams)}
          isLoading={isLoading}
        />

        <Tabs defaultValue="music" value={activeTab}>
          <MusicTabs activeTab={activeTab} onTabChange={handleTabChange} />
          
          <TabsContent value="music" className="space-y-4">
            {musicTracks.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {musicTracks.map((track) => (
                  <MusicTrackCard
                    key={track.id}
                    track={track}
                    isPlaying={isPlaying}
                    isCurrentTrack={(currentTrack?.id === track.id || previewTrack?.id === track.id)}
                    onPreviewTrack={handlePreviewTrack}
                    onAddToPlaylist={(track, playlistId) => {
                      const playlist = playlists.find(p => p.id === playlistId);
                      if (playlist) {
                        handleAddToPlaylist(track, playlist);
                      }
                    }}
                    onShowPlaylistCreator={() => setShowPlaylistCreator(true)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Geen muziek tracks gevonden</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="playlists" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowPlaylistCreator(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe afspeellijst
              </Button>
            </div>
            
            {playlists.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {playlists.map((playlist) => {
                  const playlistTracks = getPlaylistTracks(playlist);
                  const isCurrentPlaylist = selectedPlaylist?.id === playlist.id && isPlaying;
                  
                  return (
                    <PlaylistCard
                      key={playlist.id}
                      playlist={playlist}
                      isCurrentPlaylist={isCurrentPlaylist}
                      isPlaying={isPlaying}
                      playlistTracks={playlistTracks}
                      onPlayPlaylist={() => handlePlayPlaylist(
                        playlist, 
                        handleStreamStop, 
                        setCurrentTrack, 
                        setIsPlaying
                      )}
                      onStopPlaylist={() => handleStopPlaylist(setCurrentTrack, setIsPlaying)}
                      onRemoveFromPlaylist={(trackId) => handleRemoveFromPlaylist(
                        trackId, 
                        playlist.id, 
                        setCurrentTrack, 
                        setIsPlaying
                      )}
                      currentTrackId={currentTrack?.id}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Geen afspeellijsten gevonden</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setShowPlaylistCreator(true)}
                >
                  Maak je eerste afspeellijst
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="radio" className="space-y-4">
            {isLoadingStreams ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : radioStreams.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {radioStreams.map((stream) => (
                  <RadioStreamCard
                    key={stream.id}
                    stream={stream}
                    isPlaying={hiddenIframeUrl === stream.url}
                    onPlay={() => handleStreamPlay(stream)}
                    onStop={handleStreamStop}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Geen radiolinks gevonden</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Music Player */}
      {shouldShowPlayer && currentPlayingTrack && isPlaying && (
        <MusicPlayer
          currentTrack={currentPlayingTrack}
          selectedPlaylist={selectedPlaylist ? {
            id: selectedPlaylist.id,
            name: selectedPlaylist.name
          } : null}
          nextTrackUrl={nextTrack?.audioUrl}
          isPlaying={isPlaying}
          audioRef={audioPlayerRef}
          onStop={previewTrack ? handleStopPreview : () => {
            setIsPlaying(false);
            setCurrentTrack(null);
          }}
          onTrackEnded={handleTrackEnded}
          onCrossfadeStart={handleCrossfadeStart}
          onPlayPauseChange={setIsPlaying}
        />
      )}
      
      {/* Radio Player */}
      {hiddenIframeUrl && (
        <RadioPlayer
          streamTitle="Radio Stream"
          onStop={handleStreamStop}
        />
      )}
      
      {/* Hidden iframe for radio streams */}
      <iframe 
        ref={hiddenIframeRef}
        src={hiddenIframeUrl || ""}
        style={{ display: 'none' }} 
        title="Radio Stream"
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
