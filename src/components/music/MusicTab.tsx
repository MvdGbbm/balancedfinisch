
import React, { useState } from "react";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Soundscape } from "@/lib/types";
import { TrackCard } from "./TrackCard";

interface MusicTabProps {
  musicTracks: Soundscape[];
  categories: string[];
  onShuffleMusic: () => void;
  onAddToPlaylist: (track: Soundscape, playlist: any) => void;
  onPlaylistCreation: () => void;
}

export const MusicTab: React.FC<MusicTabProps> = ({
  musicTracks,
  categories,
  onShuffleMusic,
  onAddToPlaylist,
  onPlaylistCreation
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Filter by selected category
  const filteredMusicTracks = selectedCategory === "all" 
    ? musicTracks 
    : musicTracks.filter(track => track.tags?.includes(selectedCategory));
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Select 
          value={selectedCategory} 
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Categorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle categorieën</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button variant="outline" size="sm" onClick={onShuffleMusic}>
          <Shuffle className="h-4 w-4 mr-1" />
          Shuffle
        </Button>
      </div>
      
      <div className="space-y-2">
        {filteredMusicTracks.length > 0 ? (
          filteredMusicTracks.map(track => (
            <TrackCard 
              key={track.id} 
              track={track} 
              onAddToPlaylist={onAddToPlaylist}
              onPlaylistCreation={onPlaylistCreation}
              showRemoveButton={false}
            />
          ))
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            Geen muziek gevonden in deze categorie
          </p>
        )}
      </div>
    </div>
  );
};
