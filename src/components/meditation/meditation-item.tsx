
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, StopCircle } from "lucide-react";
import { Meditation } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MeditationItemProps {
  meditation: Meditation;
  isSelected: boolean;
  onSelect: (meditation: Meditation) => void;
  isPlaying?: boolean;
  onStopPlaying?: () => void;
}

export function MeditationItem({ 
  meditation, 
  isSelected, 
  onSelect,
  isPlaying,
  onStopPlaying
}: MeditationItemProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors",
        isSelected && "bg-primary/10"
      )}
      onClick={() => onSelect(meditation)}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded bg-cover bg-center" 
          style={{ backgroundImage: `url(${meditation.coverImageUrl})` }}
        />
        <div>
          <h3 className="font-medium line-clamp-1">{meditation.title}</h3>
          <p className="text-xs text-muted-foreground">{meditation.duration} min</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {isPlaying && onStopPlaying && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onStopPlaying();
            }}
          >
            <StopCircle className="h-4 w-4" />
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-primary"
        >
          <Play className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
