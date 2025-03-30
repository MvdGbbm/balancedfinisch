
import React from "react";
import { Soundscape } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, StopCircle, Heart, Volume2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PlaylistSelector } from "@/components/playlist/playlist-selector";
import { Playlist } from "@/components/playlist/types";

interface MusicTrackCardProps {
  track: Soundscape;
  isPlaying: boolean;
  onPlayTrack: (track: Soundscape) => void;
  onAddToPlaylist: (track: Soundscape, playlist: Playlist) => void;
  onToggleFavorite?: (track: Soundscape) => void;
  playlists: Playlist[];
  onCreatePlaylist: () => void;
}

export const MusicTrackCard: React.FC<MusicTrackCardProps> = ({
  track,
  isPlaying,
  onPlayTrack,
  onAddToPlaylist,
  onToggleFavorite,
  playlists,
  onCreatePlaylist
}) => {
  return (
    <Card 
      className={cn(
        "transition-all",
        isPlaying 
          ? 'ring-2 ring-primary border-primary bg-primary/5' 
          : 'bg-background/30 backdrop-blur-sm border-muted'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Track thumbnail */}
          <div 
            className="w-14 h-14 rounded-md bg-cover bg-center flex-shrink-0 border border-muted/50"
            style={{ backgroundImage: `url(${track.coverImageUrl})` }}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 max-w-[80%]">
                <h3 className="font-medium truncate">{track.title}</h3>
                {isPlaying && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                    Speelt nu
                  </Badge>
                )}
              </div>
              
              {/* Favorite button */}
              {onToggleFavorite && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={cn(
                    "h-8 w-8",
                    track.isFavorite && "text-red-500 hover:text-red-600"
                  )}
                  onClick={() => onToggleFavorite(track)}
                  aria-label={track.isFavorite ? "Verwijder van favorieten" : "Voeg toe aan favorieten"}
                >
                  <Heart className="h-5 w-5" fill={track.isFavorite ? "currentColor" : "none"} />
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{track.description}</p>
          </div>
        </div>
        
        <div className="flex justify-between mt-3">
          <div className="flex gap-2">
            <Button 
              variant={isPlaying ? "destructive" : "outline"}
              size="sm" 
              onClick={() => onPlayTrack(track)}
              className={cn(
                "flex items-center gap-1",
                isPlaying
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-background/10 backdrop-blur-sm border-muted hover:bg-background/20'
              )}
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
            playlists={playlists}
            onSelectPlaylist={(playlist) => onAddToPlaylist(track, playlist)}
            onCreateNew={onCreatePlaylist}
          />
        </div>
      </CardContent>
    </Card>
  );
};
