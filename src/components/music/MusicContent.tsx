
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Soundscape } from "@/lib/types";
import { Playlist } from "@/components/playlist/types";
import { MusicTrackCard } from "./MusicTrackCard";
import { PlaylistCard } from "./PlaylistCard";
import { RadioStreamCard } from "./RadioStreamCard";
import { RadioStream } from "@/hooks/use-radio-streams";

interface MusicContentProps {
  activeTab: string;
  musicTracks: Soundscape[];
  playlists: Playlist[];
  selectedPlaylist: Playlist | null;
  isPlaying: boolean;
  currentTrack: Soundscape | null;
  previewTrack: Soundscape | null;
  radioStreams: RadioStream[];
  isLoadingStreams: boolean;
  hiddenIframeUrl: string | null;
  setShowPlaylistCreator: (show: boolean) => void;
  handlePreviewTrack: (track: Soundscape) => void;
  handleAddToPlaylist: (track: Soundscape, playlistId: string) => void;
  handlePlayPlaylist: (playlist: Playlist) => void;
  handleStopPlaylist: () => void;
  handleRemoveFromPlaylist: (trackId: string, playlistId: string) => void;
  handleStreamPlay: (stream: RadioStream) => void;
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
  return (
    <>
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
                onAddToPlaylist={(track, playlistId) => handleAddToPlaylist(track, playlistId)}
                onShowPlaylistCreator={() => setShowPlaylistCreator(true)}
                playlists={playlists}
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
                  onPlayPlaylist={() => handlePlayPlaylist(playlist)}
                  onStopPlaylist={handleStopPlaylist}
                  onRemoveFromPlaylist={(trackId) => handleRemoveFromPlaylist(
                    trackId, 
                    playlist.id
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
    </>
  );
};
