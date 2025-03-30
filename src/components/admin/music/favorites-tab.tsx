
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Heart, ListMusic, MoreVertical, Music, Shuffle, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MusicTrack } from "./types";
import { CreatePlaylistDialog } from "@/components/playlist/create-playlist-dialog";
import { useToast } from "@/hooks/use-toast";

// Mock favorite music data
const mockFavorites: MusicTrack[] = [
  {
    id: "1",
    title: "Ontspannende oceaangolven",
    description: "Kalme oceaangolven voor meditatie",
    duration: 180,
    audioUrl: "https://example.com/ocean.mp3",
    category: "Natuur",
    tags: ["ontspannend", "oceaan", "natuurgeluiden"],
    coverImage: "https://via.placeholder.com/150"
  },
  {
    id: "3",
    title: "Pianomelodieën",
    description: "Rustgevende pianomuziek",
    duration: 300,
    audioUrl: "https://example.com/piano.mp3",
    category: "Instrumentaal",
    tags: ["piano", "klassiek", "rustig"],
    coverImage: "https://via.placeholder.com/150"
  }
];

export const FavoritesTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const { toast } = useToast();

  // Filter favorites based on search
  const filteredFavorites = mockFavorites.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleShuffle = () => {
    toast({
      title: "Shuffle gestart",
      description: "Je favorieten worden nu in willekeurige volgorde afgespeeld"
    });
  };

  const handleAddToPlaylist = (trackId: string) => {
    setSelectedTrackId(trackId);
    setIsCreatePlaylistOpen(true);
  };

  const handleRemoveFavorite = (trackId: string) => {
    toast({
      title: "Verwijderd uit favorieten",
      description: "De track is verwijderd uit je favorieten"
    });
  };
  
  const handleCreatePlaylist = (name: string) => {
    toast({
      title: "Afspeellijst aangemaakt",
      description: `"${name}" is aangemaakt en track is toegevoegd`
    });
    setIsCreatePlaylistOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <Button variant="outline" onClick={handleShuffle} className="flex gap-2 items-center">
          <Shuffle className="h-4 w-4" />
          <span>Shuffle Favorieten</span>
        </Button>

        <div className="flex w-full md:w-auto">
          <Input 
            placeholder="Zoek in favorieten..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFavorites.map(track => (
              <Card key={track.id} className="overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{track.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm z-50">
                        <DropdownMenuItem onClick={() => handleAddToPlaylist(track.id)}>
                          <ListMusic className="h-4 w-4 mr-2" />
                          <span>Toevoegen aan afspeellijst</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRemoveFavorite(track.id)} className="text-destructive">
                          <Heart className="h-4 w-4 mr-2 fill-current" />
                          <span>Verwijderen uit favorieten</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">{track.description}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {track.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <Badge>{track.category}</Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">Geen favorieten gevonden</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Je hebt nog geen favoriete muziek toegevoegd of er zijn geen resultaten voor je zoekopdracht.
            </p>
          </div>
        )}
      </ScrollArea>

      <CreatePlaylistDialog
        open={isCreatePlaylistOpen}
        onOpenChange={setIsCreatePlaylistOpen}
        onSubmit={handleCreatePlaylist}
      />
    </div>
  );
};
