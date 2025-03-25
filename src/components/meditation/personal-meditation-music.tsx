
import React, { useState } from "react";
import { Soundscape } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/audio-player";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";

interface PersonalMeditationMusicProps {
  meditationMusic: Soundscape[];
}

export function PersonalMeditationMusic({ meditationMusic }: PersonalMeditationMusicProps) {
  const { updateSoundscape } = useApp();
  const [selectedMusic, setSelectedMusic] = useState<Soundscape | null>(null);

  const favorites = meditationMusic.filter(music => music.isFavorite);
  const allMusic = meditationMusic;

  const toggleFavorite = (music: Soundscape) => {
    const isFavorite = !music.isFavorite;
    
    // Check if we're trying to add a new favorite but already have 3
    if (isFavorite && favorites.length >= 3 && !music.isFavorite) {
      toast.warning("Je kunt maximaal 3 favorieten hebben. Verwijder eerst een andere favoriet.");
      return;
    }
    
    updateSoundscape(music.id, { ...music, isFavorite });
    
    if (isFavorite) {
      toast.success(`${music.title} toegevoegd aan favorieten`);
    } else {
      toast.success(`${music.title} verwijderd uit favorieten`);
    }
  };

  const handleSelectMusic = (music: Soundscape) => {
    setSelectedMusic(music);
  };

  return (
    <div className="space-y-6">
      {favorites.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3">Favorieten</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {favorites.map((music) => (
              <MeditationMusicCard 
                key={music.id} 
                music={music} 
                isSelected={selectedMusic?.id === music.id}
                onSelect={handleSelectMusic}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-medium mb-3">Alle Meditatie Muziek</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allMusic.map((music) => (
            <MeditationMusicCard 
              key={music.id} 
              music={music} 
              isSelected={selectedMusic?.id === music.id}
              onSelect={handleSelectMusic}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </div>
      
      {selectedMusic && (
        <div className="mt-4">
          <AudioPlayer 
            audioUrl={selectedMusic.audioUrl}
            title={selectedMusic.title}
            showTitle
          />
        </div>
      )}
    </div>
  );
}

interface MeditationMusicCardProps {
  music: Soundscape;
  isSelected: boolean;
  onSelect: (music: Soundscape) => void;
  onToggleFavorite: (music: Soundscape) => void;
}

function MeditationMusicCard({ music, isSelected, onSelect, onToggleFavorite }: MeditationMusicCardProps) {
  return (
    <Card 
      className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => onSelect(music)}
    >
      <div className="aspect-video relative">
        <img 
          src={music.coverImageUrl} 
          alt={music.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-3 left-3 right-10">
          <h3 className="text-white font-medium truncate">{music.title}</h3>
          <p className="text-white/80 text-sm truncate">{music.description}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-white hover:bg-black/20"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(music);
          }}
        >
          <Heart 
            className={`h-5 w-5 ${music.isFavorite ? "fill-red-500 text-red-500" : ""}`} 
          />
        </Button>
      </div>
      <CardContent className="p-3">
        <div className="flex flex-wrap gap-1">
          {music.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag} 
              className="text-xs bg-secondary/20 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
