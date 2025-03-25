
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Play, StopCircle } from "lucide-react";
import { PlaylistSelector } from "@/components/playlist/playlist-selector";
import { MusicTrackProps } from "./types";

export const MusicTrack: React.FC<MusicTrackProps> = ({ 
  track, 
  isSelected, 
  onPreview, 
  isPlaying,
  onAddToPlaylist
}) => {
  return (
    <Card 
      key={track.id} 
      className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''} bg-background/30 backdrop-blur-sm border-muted`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-100/10 dark:bg-blue-900/20">
            <Music className="h-5 w-5 text-blue-500 dark:text-blue-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{track.title}</h3>
            <p className="text-sm text-muted-foreground">{track.description}</p>
          </div>
        </div>
        
        <div className="flex justify-between mt-3">
          <div className="flex gap-2">
            <Button 
              variant={isPlaying ? "destructive" : "outline"}
              size="sm" 
              onClick={() => onPreview(track)}
              className="flex items-center gap-1 bg-background/10 backdrop-blur-sm border-muted hover:bg-background/20"
            >
              {isPlaying ? (
                <>
                  <StopCircle className="h-4 w-4" />
                  Stoppen
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Voorluisteren
                </>
              )}
            </Button>
          </div>
          
          <PlaylistSelector 
            playlists={[]} // This will be populated by props
            onSelectPlaylist={(playlist) => onAddToPlaylist(track)}
            onCreateNew={() => {}} // This will be handled by parent
          />
        </div>
      </CardContent>
    </Card>
  );
};
