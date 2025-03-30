
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Volume2, StopCircle } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { ToneEqualizer } from "@/components/music/tone-equalizer";
import { Soundscape } from "@/lib/types";
import { Playlist } from "@/components/playlist/types";

interface MusicPlayerProps {
  currentTrack: Soundscape | null;
  nextTrack: Soundscape | null;
  isPlaying: boolean;
  isStreamPlaying: boolean;
  hiddenIframeUrl: string | null;
  streamTitle: string;
  isAudioActive: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  selectedPlaylist: Playlist | null;
  previewTrack: Soundscape | null;
  onStopPreview: () => void;
  onStopPlaylist: () => void;
  onStopStream: () => void;
  onTrackEnded: () => void;
  onCrossfadeStart: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentTrack,
  nextTrack,
  isPlaying,
  isStreamPlaying,
  hiddenIframeUrl,
  streamTitle,
  isAudioActive,
  audioRef,
  selectedPlaylist,
  previewTrack,
  onStopPreview,
  onStopPlaylist,
  onStopStream,
  onTrackEnded,
  onCrossfadeStart,
  setIsPlaying,
}) => {
  const shouldShowPlayer = isPlaying || isStreamPlaying || hiddenIframeUrl;
  const currentPlayingTrack = previewTrack || currentTrack;

  if (!shouldShowPlayer) {
    return null;
  }

  if (hiddenIframeUrl) {
    return (
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t shadow-lg z-40 animate-slide-up">
        <div className="mx-auto max-w-4xl px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Volume2 className="h-5 w-5 text-primary mr-2 animate-pulse" />
            <div>
              <h3 className="font-medium text-sm">Radio Stream</h3>
              <p className="text-xs text-muted-foreground">Streaming actief in de achtergrond</p>
            </div>
            <Badge variant="outline" className="ml-2 text-xs border-primary/50 text-primary animate-pulse">
              Live
            </Badge>
          </div>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onStopStream}
            className="flex items-center gap-1"
          >
            <StopCircle className="h-4 w-4" />
            Stoppen
          </Button>
        </div>
      </div>
    );
  }

  if (currentPlayingTrack) {
    return (
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t shadow-lg z-40 animate-slide-up">
        <div className="mx-auto max-w-4xl px-4 py-2">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <h3 className="font-medium text-sm">
                {selectedPlaylist ? `${selectedPlaylist.name}: ${currentPlayingTrack.title}` : currentPlayingTrack.title}
              </h3>
              <Badge variant="outline" className="ml-2 text-xs border-primary/50 text-primary animate-pulse">
                Nu Spelend
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 rounded-full" 
              onClick={previewTrack ? onStopPreview : onStopPlaylist}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <ToneEqualizer 
            isActive={isAudioActive} 
            className="mb-1" 
            audioRef={audioRef} 
          />
          
          <AudioPlayer 
            audioUrl={currentPlayingTrack.audioUrl}
            nextAudioUrl={nextTrack?.audioUrl}
            showControls={true}
            title={currentPlayingTrack.title}
            className="mb-0"
            onEnded={onTrackEnded}
            onCrossfadeStart={onCrossfadeStart}
            isPlayingExternal={isPlaying}
            onPlayPauseChange={setIsPlaying}
            ref={audioRef}
          />
        </div>
      </div>
    );
  }

  return null;
};
