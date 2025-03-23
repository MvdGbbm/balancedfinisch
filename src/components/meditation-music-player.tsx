
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
import { useToast } from "@/hooks/use-toast";

export function MeditationMusicPlayer() {
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const { toast } = useToast();

  // Filter meditations for guided meditations only
  const meditationMusic = meditations.filter(item => 
    item.category === "Geleide Meditaties"
  );

  // If we have meditation music available, set the first one as default
  React.useEffect(() => {
    if (meditationMusic.length > 0 && !selectedMusic) {
      setSelectedMusic(meditationMusic[0]);
    }
  }, [meditationMusic, selectedMusic]);

  const handleMusicSelect = (meditation) => {
    setSelectedMusic(meditation);
    setIsPlayerVisible(true);
    toast({
      title: "Meditatie geselecteerd",
      description: `${meditation.title} is geselecteerd en klaar om af te spelen.`
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Music className="text-primary h-4 w-4" />
          <h3 className="text-sm font-medium">Geleide Meditaties</h3>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <span className="truncate max-w-[160px]">
                {isPlayerVisible && selectedMusic ? selectedMusic.title : "Kies meditatie"}
              </span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[220px] bg-popover/95 backdrop-blur-sm">
            <DropdownMenuGroup>
              {meditationMusic.length > 0 ? (
                meditationMusic.map((meditation) => (
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
                ))
              ) : (
                <DropdownMenuItem disabled>
                  Geen geleide meditaties beschikbaar
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {isPlayerVisible && selectedMusic && (
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
