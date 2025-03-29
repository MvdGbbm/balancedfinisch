
import React, { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Soundscape } from "@/lib/types";
import { Playlist } from "@/components/playlist/types";
import { PlaylistCard } from "./PlaylistCard";
import { RadioStreamCard } from "./RadioStreamCard";
import { RadioStream } from "@/hooks/use-radio-streams";
import { MusicTrackCard } from "./MusicTrackCard";
import { PlaylistSelector } from "@/components/playlist/playlist-selector";
import { Separator } from "@/components/ui/separator";

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
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [trackToAdd, setTrackToAdd] = useState<Soundscape | null>(null);

  const handleAddToPlaylistClick = (track: Soundscape) => {
    setTrackToAdd(track);
    setShowPlaylistCreator(true);
  };

  return (
    <>
      <TabsContent value="muziek" className="space-y-2 mt-2">
        <div className="grid grid-cols-1 gap-1">
          {musicTracks.length > 0 ? (
            musicTracks.map((track) => (
              <MusicTrackCard
                key={track.id}
                track={track}
                isPlaying={isPlaying}
                isCurrentTrack={currentTrack?.id === track.id && !previewTrack}
                onPlay={handlePreviewTrack}
                onStop={handleStopPlaylist}
                onAddToPlaylist={handleAddToPlaylistClick}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Geen muziek gevonden</p>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="playlists" className="space-y-4 mt-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Mijn afspeellijsten</h2>
          <Button 
            size="sm"
            onClick={() => setShowPlaylistCreator(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Nieuwe lijst
          </Button>
        </div>
        
        {playlists.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
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
          <div className="text-center py-6 bg-background/30 rounded-lg border border-muted">
            <p className="text-muted-foreground mb-2">Geen afspeellijsten gevonden</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPlaylistCreator(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Maak je eerste afspeellijst
            </Button>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="radio" className="space-y-4 mt-2">
        {isLoadingStreams ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
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
          <div className="text-center py-6 bg-background/30 rounded-lg border border-muted">
            <p className="text-muted-foreground">Geen radiostreams gevonden</p>
          </div>
        )}
      </TabsContent>
    </>
  );
};
