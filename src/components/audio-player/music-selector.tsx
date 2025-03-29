
import React from "react";
import { Soundscape } from "@/lib/types";
import { Music, Volume2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

interface MusicSelectorProps {
  selectedMusic: string;
  onMusicChange: (value: string) => void;
}

export const MusicSelector: React.FC<MusicSelectorProps> = ({ 
  selectedMusic, 
  onMusicChange 
}) => {
  const { soundscapes } = useApp();
  
  // Filter music tracks to only include those from the Music category
  const musicTracks = soundscapes.filter(track => track.category === "Muziek");
  
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold mb-2">Muziek op de achtergrond</h3>
      <Select
        value={selectedMusic}
        onValueChange={onMusicChange}
      >
        <SelectTrigger className="w-full bg-background border-muted">
          <span className="flex items-center">
            <Music className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Selecteer muziek">
              {musicTracks.find(track => track.audioUrl === selectedMusic)?.title || "Selecteer muziek"}
            </SelectValue>
          </span>
        </SelectTrigger>
        <SelectContent>
          {musicTracks.map(track => (
            <SelectItem key={track.id} value={track.audioUrl}>
              <div className="flex items-center">
                {track.audioUrl === selectedMusic && (
                  <Volume2 className="w-4 h-4 mr-2 text-primary animate-pulse" />
                )}
                <span>{track.title}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
