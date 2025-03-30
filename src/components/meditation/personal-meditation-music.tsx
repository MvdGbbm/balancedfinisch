
import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Soundscape } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/audio-player";
import { Heart, Music, Edit, Play, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const PersonalMeditationMusic = () => {
  const { soundscapes, updateSoundscape } = useApp();
  const [selectedSoundscape, setSelectedSoundscape] = useState<Soundscape | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Filter soundscapes to only include those with the "Persoonlijke Meditatie" category
  const personalMeditationMusic = soundscapes.filter(
    soundscape => soundscape.category === "Persoonlijke Meditatie"
  );
  
  // Get favorites (limit to 3)
  const favorites = personalMeditationMusic.filter(soundscape => soundscape.isFavorite).slice(0, 3);
  
  const toggleFavorite = (soundscape: Soundscape) => {
    // Check if we're trying to add a new favorite
    if (!soundscape.isFavorite) {
      // Check if we already have 3 favorites
      if (favorites.length >= 3) {
        toast.error("Je kunt maximaal 3 favorieten hebben. Verwijder eerst een favoriet.");
        return;
      }
    }
    
    // Toggle favorite status
    updateSoundscape(soundscape.id, {
      ...soundscape,
      isFavorite: !soundscape.isFavorite
    });
    
    // Show success message
    if (!soundscape.isFavorite) {
      toast.success(`${soundscape.title} toegevoegd aan favorieten`);
    } else {
      toast.success(`${soundscape.title} verwijderd uit favorieten`);
    }
  };
  
  const handlePlaySoundscape = (soundscape: Soundscape) => {
    setSelectedSoundscape(soundscape);
    setIsPlaying(true);
  };
  
  return (
    <div className="space-y-6">
      {/* Favorites Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Favorieten</h3>
          <span className="text-xs text-muted-foreground">Maximaal 3</span>
        </div>
        
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {favorites.map((soundscape) => (
              <Card 
                key={soundscape.id} 
                className={cn(
                  "overflow-hidden border-muted bg-background/30 backdrop-blur-sm",
                  selectedSoundscape?.id === soundscape.id && "border-primary"
                )}
              >
                <div className="flex items-center p-3">
                  <div 
                    className="w-12 h-12 rounded-md bg-cover bg-center mr-3" 
                    style={{ backgroundImage: `url(${soundscape.coverImageUrl})` }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-medium truncate">{soundscape.title}</h4>
                      <Heart className="h-4 w-4 ml-2 text-red-500 fill-red-500" />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{soundscape.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={cn(
                        "h-8 w-8 text-red-500",
                        soundscape.isFavorite && "text-red-500 hover:text-red-600"
                      )}
                      onClick={() => toggleFavorite(soundscape)}
                    >
                      <Heart className="h-5 w-5" fill={soundscape.isFavorite ? "currentColor" : "none"} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handlePlaySoundscape(soundscape)}
                    >
                      <Play className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border rounded-lg bg-background/30">
            <p className="text-muted-foreground">Geen favorieten gevonden</p>
            <p className="text-xs text-muted-foreground mt-1">
              Klik op het hartje om een muziekstuk toe te voegen aan je favorieten
            </p>
          </div>
        )}
      </div>
      
      {/* All Personal Meditation Music */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Alle Persoonlijke Meditatie Muziek</h3>
        
        <div className="grid grid-cols-1 gap-3 pb-20">
          {personalMeditationMusic.map((soundscape) => (
            <Card 
              key={soundscape.id} 
              className={cn(
                "overflow-hidden border-muted bg-background/30 backdrop-blur-sm",
                selectedSoundscape?.id === soundscape.id && "border-primary"
              )}
            >
              <div className="flex items-center p-3">
                <div 
                  className="w-12 h-12 rounded-md bg-cover bg-center mr-3" 
                  style={{ backgroundImage: `url(${soundscape.coverImageUrl})` }}
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-medium truncate">{soundscape.title}</h4>
                    {soundscape.isFavorite && (
                      <Heart className="h-4 w-4 ml-2 text-red-500 fill-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{soundscape.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={cn(
                      "h-8 w-8",
                      soundscape.isFavorite && "text-red-500 hover:text-red-600"
                    )}
                    onClick={() => toggleFavorite(soundscape)}
                  >
                    <Heart className="h-5 w-5" fill={soundscape.isFavorite ? "currentColor" : "none"} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePlaySoundscape(soundscape)}
                  >
                    <Play className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Player */}
      {selectedSoundscape && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-10 h-10 rounded-md bg-cover bg-center" 
              style={{ backgroundImage: `url(${selectedSoundscape.coverImageUrl})` }}
            />
            <div className="flex-1">
              <h4 className="font-medium text-sm truncate">{selectedSoundscape.title}</h4>
              <p className="text-xs text-muted-foreground truncate">Persoonlijke Meditatie</p>
            </div>
          </div>
          <AudioPlayer 
            audioUrl={selectedSoundscape.audioUrl} 
            className="w-full"
            isPlayingExternal={isPlaying}
            onPlayPauseChange={setIsPlaying}
          />
        </div>
      )}
    </div>
  );
};
