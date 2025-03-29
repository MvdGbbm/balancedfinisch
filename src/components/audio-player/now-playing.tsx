
import React from "react";
import { Volume2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface NowPlayingProps {
  selectedMusic: string;
  title?: string;
}

export const NowPlaying: React.FC<NowPlayingProps> = ({ selectedMusic, title }) => {
  const { soundscapes } = useApp();
  
  // Filter music tracks to only include those from the Music category
  const musicTracks = soundscapes.filter(track => track.category === "Muziek");
  
  return (
    <div className="py-2 px-3 bg-background/30 border border-muted rounded-md flex items-center">
      <Volume2 className="h-4 w-4 text-primary mr-2" />
      <p className="text-sm">
        Nu afspelend: {musicTracks.find(track => track.audioUrl === selectedMusic)?.title || title}
      </p>
    </div>
  );
};
