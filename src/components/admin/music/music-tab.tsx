
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
import { Music, Plus, Trash, ListMusic, Shuffle, ChevronDown, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/AppContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MusicTrack } from "./types";
import { CreatePlaylistDialog } from "@/components/playlist/create-playlist-dialog";
import { useToast } from "@/hooks/use-toast";

// Mock music data for now
const mockMusicTracks: MusicTrack[] = [
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
    id: "2",
    title: "Regenwoud Ambiance",
    description: "Geluiden uit het regenwoud",
    duration: 240,
    audioUrl: "https://example.com/rainforest.mp3",
    category: "Natuur",
    tags: ["regenwoud", "vogels", "natuurgeluiden"],
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
  },
  {
    id: "4",
    title: "Meditatieklankschalen",
    description: "Tibetaanse klankschalen",
    duration: 260,
    audioUrl: "https://example.com/bowls.mp3",
    category: "Meditatie",
    tags: ["klankschalen", "meditatie", "healing"],
    coverImage: "https://via.placeholder.com/150"
  }
];

const categories = ["Alle", "Natuur", "Instrumentaal", "Meditatie", "Ambient"];

export const MusicTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const { toast } = useToast();

  // Filter tracks based on search and category
  const filteredTracks = mockMusicTracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "Alle" || track.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleShuffle = () => {
    toast({
      title: "Shuffle gestart",
      description: "De muziek wordt nu in willekeurige volgorde afgespeeld"
    });
  };

  const handleAddToPlaylist = (trackId: string) => {
    setIsCreatePlaylistOpen(true);
  };

  const handleDelete = (trackId: string) => {
    toast({
      title: "Track verwijderd",
      description: "De muziektrack is succesvol verwijderd"
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2 items-center">
                <span>{selectedCategory}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-background/95 backdrop-blur-sm z-50">
              {categories.map(category => (
                <DropdownMenuItem 
                  key={category} 
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-primary/10 text-primary" : ""}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={handleShuffle} className="flex gap-2 items-center">
            <Shuffle className="h-4 w-4" />
            <span>Shuffle</span>
          </Button>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Input 
            placeholder="Zoeken..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Toevoegen
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTracks.map(track => (
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
                      <DropdownMenuItem onClick={() => handleDelete(track.id)} className="text-destructive">
                        <Trash className="h-4 w-4 mr-2" />
                        <span>Verwijderen</span>
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
      </ScrollArea>

      <CreatePlaylistDialog
        open={isCreatePlaylistOpen}
        onOpenChange={setIsCreatePlaylistOpen}
      />
    </div>
  );
};
