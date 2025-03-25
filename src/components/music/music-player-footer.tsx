
import React, { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { ToneEqualizer } from "@/components/music/tone-equalizer";
import { Soundscape } from "@/lib/types";

interface MusicPlayerFooterProps {
  isVisible: boolean;
  currentTrack: Soundscape | null;
  nextTrack: Soundscape | null;
  isPlaying: boolean;
  selectedPlaylist: any | null;
  audioPlayerRef: RefObject<HTMLAudioElement>;
  onStopPlaying: () => void;
  onPlayPauseChange: (isPlaying: boolean) => void;
  onTrackEnded: () => void;
  onCrossfadeStart: () => void;
  isAudioActive: boolean;
}

export const MusicPlayerFooter: React.FC<MusicPlayerFooterProps> = ({
  isVisible,
  currentTrack,
  nextTrack,
  isPlaying,
  selectedPlaylist,
  audioPlayerRef,
  onStopPlaying,
  onPlayPauseChange,
  onTrackEnded,
  onCrossfadeStart,
  isAudioActive
}) => {
  if (!isVisible || !currentTrack) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-background border-t shadow-lg z-40 animate-slide-up">
      <div className="mx-auto max-w-4xl px-4 py-2">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-medium text-sm">
            {selectedPlaylist ? `${selectedPlaylist.name}: ${currentTrack.title}` : currentTrack.title}
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 rounded-full" 
            onClick={onStopPlaying}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ToneEqualizer 
          isActive={isAudioActive} 
          className="mb-1" 
          audioRef={audioPlayerRef} 
        />
        
        <AudioPlayer 
          audioUrl={currentTrack.audioUrl}
          nextAudioUrl={nextTrack?.audioUrl}
          showControls={true}
          title={currentTrack.title}
          className="mb-0"
          onEnded={onTrackEnded}
          onCrossfadeStart={onCrossfadeStart}
          isPlayingExternal={isPlaying}
          onPlayPauseChange={onPlayPauseChange}
          ref={audioPlayerRef}
        />
      </div>
    </div>
  );
};
