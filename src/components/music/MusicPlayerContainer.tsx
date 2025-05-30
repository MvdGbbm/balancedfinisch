
import React from "react";
import { Soundscape } from "@/lib/types";
import { Playlist } from "@/components/playlist/types";
import { MusicPlayer } from "./MusicPlayer";
import { RadioPlayer } from "./RadioPlayer";

interface MusicPlayerContainerProps {
  isPlaying: boolean;
  currentPlayingTrack: Soundscape | null;
  selectedPlaylist: Playlist | null;
  nextTrack: Soundscape | null;
  isStreamPlaying: boolean;
  hiddenIframeUrl: string | null;
  hiddenIframeRef: React.RefObject<HTMLIFrameElement>;
  audioPlayerRef: React.RefObject<HTMLAudioElement>;
  handleStopPreview: () => void;
  handleTrackEnded: () => void;
  handleCrossfadeStart: () => void;
  handleStreamStop: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTrack: (track: Soundscape | null) => void;
  previewTrack: Soundscape | null;
}

export const MusicPlayerContainer: React.FC<MusicPlayerContainerProps> = ({
  isPlaying,
  currentPlayingTrack,
  selectedPlaylist,
  nextTrack,
  isStreamPlaying,
  hiddenIframeUrl,
  hiddenIframeRef,
  audioPlayerRef,
  handleStopPreview,
  handleTrackEnded,
  handleCrossfadeStart,
  handleStreamStop,
  setIsPlaying,
  setCurrentTrack,
  previewTrack
}) => {
  const shouldShowPlayer = isPlaying || isStreamPlaying || hiddenIframeUrl;

  return (
    <>
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
    </>
  );
};
