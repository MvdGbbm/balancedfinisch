
import React, { useState } from "react";
import { AudioPlayer } from "@/components/audio-player";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Music, ChevronDown } from "lucide-react";
import { meditations } from "@/data/meditations";

export function MeditationMusicPlayer() {
  const [selectedMusic, setSelectedMusic] = useState(meditations[0]);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  // Filter meditations for personal meditation music
  const meditationMusic = meditations.filter(item => 
    item.category === "Positiviteit" || 
    item.tags.includes("meditatie") || 
    item.tags.includes("ontspanning")
  );

  const handleMusicSelect = (meditation: typeof meditations[0]) => {
    setSelectedMusic(meditation);
    setIsPlayerVisible(true);
  };

  return (
    <div className="w-full max-w-lg mx-auto mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Music className="text-primary h-4 w-4" />
          <h3 className="text-sm font-medium">Meditatie Muziek</h3>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <span className="truncate max-w-[160px]">
                {isPlayerVisible ? selectedMusic.title : "Kies muziek"}
              </span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[220px]">
            <DropdownMenuGroup>
              {meditationMusic.map((meditation) => (
                <DropdownMenuItem 
                  key={meditation.id}
                  onClick={() => handleMusicSelect(meditation)}
                  className="cursor-pointer"
                >
                  <div>
                    <p className="font-medium">{meditation.title}</p>
                    <p className="text-xs text-muted-foreground">{meditation.duration} min</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {isPlayerVisible && (
        <AudioPlayer 
          audioUrl={selectedMusic.audioUrl}
          title={selectedMusic.title}
          showTitle
          showControls
          className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg shadow-sm"
        />
      )}
    </div>
  );
}
