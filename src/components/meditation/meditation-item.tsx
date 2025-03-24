
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Trash2 } from "lucide-react";
import { Meditation } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MeditationItemProps {
  meditation: Meditation;
  isSelected: boolean;
  onSelect: (meditation: Meditation) => void;
  onDelete?: (meditation: Meditation) => void;
}

export function MeditationItem({ 
  meditation, 
  isSelected, 
  onSelect,
  onDelete
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
        <div className="w-12 h-12 rounded bg-cover bg-center overflow-hidden">
          {meditation.coverImageUrl ? (
            <img 
              src={meditation.coverImageUrl} 
              alt={meditation.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default image on error
                e.currentTarget.src = "/lovable-uploads/2baf5e4f-17db-4f18-bd89-8263321b640c.png";
              }}
            />
          ) : (
            <img 
              src="/lovable-uploads/2baf5e4f-17db-4f18-bd89-8263321b640c.png" 
              alt="Muziek" 
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div>
          <h3 className="font-medium line-clamp-1">{meditation.title}</h3>
          <p className="text-xs text-muted-foreground">{meditation.duration} min</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-primary"
        >
          <Play className="h-4 w-4" />
        </Button>
        
        {onDelete && (
          <Button 
            variant="destructive" 
            size="icon" 
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(meditation);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
