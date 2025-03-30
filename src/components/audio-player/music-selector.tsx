
import React from "react";
import { Music, Volume2 } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { useAudioPlayerContext } from "./audio-player-context";

interface MusicSelectorProps {
  audioUrl: string;
}

export const MusicSelector: React.FC<MusicSelectorProps> = ({ audioUrl }) => {
  const { musicTracks, selectedMusic, handleMusicChange, isTrackPlaying } = useAudioPlayerContext();
  
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold mb-2">Muziek op de achtergrond</h3>
      <Select
        value={selectedMusic || audioUrl}
        onValueChange={handleMusicChange}
      >
        <SelectTrigger className="w-full bg-background border-muted">
          <span className="flex items-center">
            <Music className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Selecteer muziek">
              {musicTracks.find(track => track.audioUrl === (selectedMusic || audioUrl))?.title || "Selecteer muziek"}
            </SelectValue>
          </span>
        </SelectTrigger>
        <SelectContent>
          {musicTracks.map(track => (
            <SelectItem key={track.id} value={track.audioUrl}>
              <div className="flex items-center">
                {track.audioUrl === (selectedMusic || audioUrl) && (
                  <Volume2 className="w-4 h-4 mr-2 text-primary animate-pulse" />
                )}
                <span>{track.title}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {isTrackPlaying && (
        <div className="py-2 px-3 mt-2 bg-background/30 border border-muted rounded-md flex items-center">
          <Volume2 className="h-4 w-4 text-primary mr-2" />
          <p className="text-sm">
            Nu afspelend: {musicTracks.find(track => track.audioUrl === (selectedMusic || audioUrl))?.title}
          </p>
        </div>
      )}
    </div>
  );
};
