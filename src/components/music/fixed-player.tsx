
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Volume2, StopCircle } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { Soundscape } from "@/lib/types";
import { ToneEqualizer } from "@/components/music/tone-equalizer";
import { Playlist } from "@/components/playlist/types";

interface FixedPlayerProps {
  currentTrack: Soundscape | null;
  nextTrack: Soundscape | null;
  isPlaying: boolean;
  isAudioActive: boolean;
  selectedPlaylist: Playlist | null;
  onStop: () => void;
  onTrackEnded: () => void;
  onCrossfadeStart: () => void;
  onPlayPauseChange: (isPlaying: boolean) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const FixedPlayer: React.FC<FixedPlayerProps> = ({
  currentTrack,
  nextTrack,
  isPlaying,
  isAudioActive,
  selectedPlaylist,
  onStop,
  onTrackEnded,
  onCrossfadeStart,
  onPlayPauseChange,
  audioRef,
}) => {
  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-background border-t shadow-lg z-40 animate-slide-up">
      <div className="mx-auto max-w-4xl px-4 py-2">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            <h3 className="font-medium text-sm">
              {selectedPlaylist ? `${selectedPlaylist.name}: ${currentTrack.title}` : currentTrack.title}
            </h3>
            <Badge variant="outline" className="ml-2 text-xs border-primary/50 text-primary animate-pulse">
              Nu Spelend
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 rounded-full" 
            onClick={onStop}
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
          audioUrl={currentTrack.audioUrl}
          nextAudioUrl={nextTrack?.audioUrl}
          showControls={true}
          title={currentTrack.title}
          className="mb-0"
          onEnded={onTrackEnded}
          onCrossfadeStart={onCrossfadeStart}
          isPlayingExternal={isPlaying}
          onPlayPauseChange={onPlayPauseChange}
          ref={audioRef}
        />
      </div>
    </div>
  );
};
