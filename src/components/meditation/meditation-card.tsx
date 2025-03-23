
import React from "react";
import { Meditation } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface MeditationCardProps {
  meditation: Meditation;
  isSelected: boolean;
  onClick: (meditation: Meditation) => void;
}

export const MeditationCard = ({ meditation, isSelected, onClick }: MeditationCardProps) => {
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    onClick(meditation); // Use the same click handler to open the meditation
  };

  // Check if meditation has audio URL before rendering play button
  const hasAudio = !!meditation.audioUrl;

  return (
    <Card 
      key={meditation.id} 
      className={cn(
        "overflow-hidden cursor-pointer transition-all hover:shadow-md animate-slide-in",
        isSelected 
          ? "ring-2 ring-primary/50 bg-primary/5" 
          : "neo-morphism hover:translate-y-[-2px]"
      )}
      onClick={() => onClick(meditation)}
    >
      <div className="flex h-20">
        <div
          className="w-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${meditation.coverImageUrl})` }}
        />
        <CardContent className="flex-1 p-2.5 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-sm mb-0.5 line-clamp-1">{meditation.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {meditation.description}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {meditation.duration} min
            </div>
            {hasAudio && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 text-primary hover:text-primary/70 hover:bg-primary/10"
                onClick={handlePlayClick}
                aria-label="Speel meditatie af"
              >
                <Play className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
