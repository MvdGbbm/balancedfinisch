
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Music } from "lucide-react";
import { Soundscape } from "@/lib/types";
import { AudioPlayer } from "@/components/audio-player";

interface BreathingMusicSelectorProps {
  musicTracks: Soundscape[];
  currentTrack: Soundscape | null;
  isTrackPlaying: boolean;
  musicVolume: number;
  onPlayTrack: (track: Soundscape) => void;
  onPlayPauseChange: (isPlaying: boolean) => void;
  audioPlayerRef: React.RefObject<HTMLAudioElement>;
}

const BreathingMusicSelector: React.FC<BreathingMusicSelectorProps> = ({
  musicTracks,
  currentTrack,
  isTrackPlaying,
  musicVolume,
  onPlayTrack,
  onPlayPauseChange,
  audioPlayerRef
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Muziek</h3>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        {musicTracks.map(track => (
          <Button
            key={track.id}
            variant={currentTrack?.id === track.id ? "default" : "outline"}
            className={cn(
              "flex items-center justify-start text-sm p-2 h-auto",
              currentTrack?.id === track.id && isTrackPlaying && "animate-pulse"
            )}
            onClick={() => onPlayTrack(track)}
          >
            <Music className="w-4 h-4 mr-2" />
            <span className="truncate">{track.title}</span>
          </Button>
        ))}
      </div>
      
      {currentTrack && (
        <AudioPlayer
          ref={audioPlayerRef}
          audioUrl={currentTrack.audioUrl}
          title={currentTrack.title}
          isPlayingExternal={isTrackPlaying}
          onPlayPauseChange={onPlayPauseChange}
          volume={musicVolume}
        />
      )}
    </div>
  );
};

export default BreathingMusicSelector;
