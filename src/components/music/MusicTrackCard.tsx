
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Soundscape } from "@/lib/types";
import { PlaylistSelector } from "@/components/playlist/playlist-selector";
import { useToast } from "@/hooks/use-toast";
import { usePlaylists } from "@/hooks/playlists/use-playlists";
import { useApp } from "@/context/AppContext";

interface MusicTrackCardProps {
  track: Soundscape;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  onPlay: (track: Soundscape) => void;
  onStop: () => void;
  onAddToPlaylist: (track: Soundscape) => void;
}

export const MusicTrackCard: React.FC<MusicTrackCardProps> = ({
  track,
  isPlaying,
  isCurrentTrack,
  onPlay,
  onStop,
  onAddToPlaylist
}) => {
  const [showPlaylistSelector, setShowPlaylistSelector] = React.useState(false);
  const { soundscapes } = useApp();
  const { toast } = useToast();
  const { playlists, handleAddToPlaylist, handleCreatePlaylist } = usePlaylists(soundscapes);
  
  const handlePlayClick = () => {
    if (isCurrentTrack && isPlaying) {
      onStop();
    } else {
      onPlay(track);
    }
  };

  const handleAddToSelectedPlaylist = (playlistId: string) => {
    handleAddToPlaylist(track, playlistId);
    setShowPlaylistSelector(false);
    toast({
      title: "Toegevoegd aan afspeellijst",
      description: `${track.title} is toegevoegd aan de afspeellijst`
    });
  };

  const handleCreateNewPlaylist = () => {
    setShowPlaylistSelector(false);
    onAddToPlaylist(track);
  };

  return (
    <Card className="overflow-hidden hover:bg-accent/50 transition-colors border-0 bg-transparent">
      <CardContent className="p-2 flex items-center gap-2">
        <div className="relative h-10 w-10 flex-shrink-0 rounded overflow-hidden">
          <img 
            src={track.coverImageUrl} 
            alt={track.title}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/48?text=No+Image";
            }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-1">{track.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {track.description}
          </p>
        </div>
        
        <div className="flex gap-1 flex-shrink-0">
          <Button 
            size="icon" 
            variant={isCurrentTrack && isPlaying ? "default" : "ghost"}
            onClick={handlePlayClick}
            className="h-7 w-7"
          >
            {isCurrentTrack && isPlaying ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </Button>
          
          <Button 
            size="icon" 
            variant="ghost"
            onClick={() => setShowPlaylistSelector(true)}
            className="h-7 w-7"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <PlaylistSelector
          open={showPlaylistSelector}
          onOpenChange={setShowPlaylistSelector}
          playlists={playlists}
          onSelect={handleAddToSelectedPlaylist}
          onCreateNew={handleCreateNewPlaylist}
        />
      </CardContent>
    </Card>
  );
};
