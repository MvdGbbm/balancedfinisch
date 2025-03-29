
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { AudioPlayer, AudioPlayerHandle } from "@/components/audio-player";
import { ToneEqualizer } from "@/components/music/tone-equalizer";
import { Soundscape } from "@/lib/types";

interface MusicPlayerProps {
  currentTrack: Soundscape;
  selectedPlaylist?: { id: string; name: string } | null;
  nextTrackUrl?: string;
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  audioContextRef?: React.RefObject<AudioContext>;
  onStop: () => void;
  onTrackEnded: () => void;
  onCrossfadeStart: () => void;
  onPlayPauseChange: (isPlaying: boolean) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentTrack,
  selectedPlaylist,
  nextTrackUrl,
  isPlaying,
  audioRef,
  audioContextRef,
  onStop,
  onTrackEnded,
  onCrossfadeStart,
  onPlayPauseChange
}) => {
  return (
    <div className="fixed bottom-16 left-0 right-0 bg-background border-t shadow-lg z-40 animate-slide-up">
      <div className="mx-auto max-w-4xl px-4 py-2">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            <h3 className="font-medium text-sm">
              {selectedPlaylist 
                ? `${selectedPlaylist.name}: ${currentTrack.title}` 
                : currentTrack.title
              }
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
          isActive={isPlaying} 
          className="mb-1" 
          audioRef={audioRef}
        />
        
        <AudioPlayer 
          audioUrl={currentTrack.audioUrl}
          nextAudioUrl={nextTrackUrl}
          showControls={true}
          title={currentTrack.title}
          className="mb-0"
          onEnded={onTrackEnded}
          onCrossfadeStart={onCrossfadeStart}
          isPlayingExternal={isPlaying}
          onPlayPauseChange={onPlayPauseChange}
          ref={audioRef as React.Ref<AudioPlayerHandle>}
        />
      </div>
    </div>
  );
};
