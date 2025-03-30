
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListMusic, Plus, Play, Pause, Music, Trash, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Playlist } from "@/components/playlist/types";
import { CreatePlaylistDialog } from "@/components/playlist/create-playlist-dialog";
import { useToast } from "@/hooks/use-toast";

// Mock playlists
const mockPlaylists: Playlist[] = [
  {
    id: "playlist-1",
    name: "Meditatie Mix",
    tracks: [
      { trackId: "1", added: "2023-05-15T14:30:00Z" },
      { trackId: "4", added: "2023-05-16T09:15:00Z" }
    ],
    createdAt: "2023-05-15T14:30:00Z"
  },
  {
    id: "playlist-2",
    name: "Ontspannende Natuurgeluiden",
    tracks: [
      { trackId: "1", added: "2023-06-10T18:45:00Z" },
      { trackId: "2", added: "2023-06-10T18:47:00Z" }
    ],
    createdAt: "2023-06-10T18:45:00Z"
  },
  {
    id: "playlist-3",
    name: "Werkfocus",
    tracks: [
      { trackId: "3", added: "2023-07-22T09:30:00Z" }
    ],
    createdAt: "2023-07-22T09:30:00Z"
  }
];

// Mock function to get track names - in a real app, this would fetch from your actual tracks
const getTrackNameById = (id: string): string => {
  const trackNames: Record<string, string> = {
    "1": "Ontspannende oceaangolven",
    "2": "Regenwoud Ambiance",
    "3": "Pianomelodieën",
    "4": "Meditatieklankschalen"
  };
  return trackNames[id] || "Onbekende track";
};

export const PlaylistsTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [playlists, setPlaylists] = useState<Playlist[]>(mockPlaylists);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const { toast } = useToast();

  // Filter playlists based on search
  const filteredPlaylists = playlists.filter(playlist => 
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePlaylist = () => {
    setIsCreatePlaylistOpen(true);
  };

  const handleDeletePlaylist = (id: string) => {
    setPlaylists(playlists.filter(playlist => playlist.id !== id));
    toast({
      title: "Afspeellijst verwijderd",
      description: "De afspeellijst is succesvol verwijderd"
    });
  };

  const togglePlayPlaylist = (id: string) => {
    setCurrentlyPlaying(currentlyPlaying === id ? null : id);
    
    const targetPlaylist = playlists.find(playlist => playlist.id === id);
    if (targetPlaylist) {
      toast({
        title: currentlyPlaying === id ? "Afspeellijst gepauzeerd" : "Afspeellijst gestart",
        description: currentlyPlaying === id 
          ? `${targetPlaylist.name} is gepauzeerd` 
          : `${targetPlaylist.name} wordt nu afgespeeld`
      });
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ListMusic className="h-5 w-5 text-primary" />
          <span>Afspeellijsten</span>
        </h2>

        <div className="flex gap-2 w-full md:w-auto">
          <Input 
            placeholder="Zoeken..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={handleCreatePlaylist}>
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe afspeellijst
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaylists.map(playlist => (
            <Card 
              key={playlist.id} 
              className={`overflow-hidden hover:shadow-md transition-all ${currentlyPlaying === playlist.id ? 'border-primary' : ''}`}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{playlist.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePlayPlaylist(playlist.id)}
                  >
                    {currentlyPlaying === playlist.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Aangemaakt op {formatDate(playlist.createdAt)}</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-4 pt-0">
                <div className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Music className="h-4 w-4" />
                  <span>{playlist.tracks.length} tracks</span>
                </div>
                
                <ul className="text-sm space-y-1">
                  {playlist.tracks.slice(0, 3).map((track, index) => (
                    <li key={track.trackId} className="truncate text-muted-foreground">
                      {index + 1}. {getTrackNameById(track.trackId)}
                    </li>
                  ))}
                  {playlist.tracks.length > 3 && (
                    <li className="text-muted-foreground">
                      + {playlist.tracks.length - 3} meer
                    </li>
                  )}
                </ul>
              </CardContent>
              
              <CardFooter className="p-4 pt-0 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive" 
                  onClick={() => handleDeletePlaylist(playlist.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <CreatePlaylistDialog
        open={isCreatePlaylistOpen}
        onOpenChange={setIsCreatePlaylistOpen}
      />
    </div>
  );
};
