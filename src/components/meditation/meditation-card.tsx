
import React from "react";
import { Meditation } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Music, Heart } from "lucide-react";

interface MeditationCardProps {
  meditation: Meditation;
  isSelected?: boolean;
  onClick?: (meditation: Meditation) => void;
}

export const MeditationCard: React.FC<MeditationCardProps> = ({
  meditation,
  isSelected = false,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(meditation);
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-primary ring-2 ring-primary/30' : ''}`}
      onClick={handleClick}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <div 
          className="h-12 w-12 rounded-md bg-cover bg-center flex-shrink-0"
          style={{ 
            backgroundImage: meditation.coverImageUrl 
              ? `url(${meditation.coverImageUrl})` 
              : "none" 
          }}
        >
          {!meditation.coverImageUrl && (
            <div className="h-full w-full flex items-center justify-center bg-muted rounded-md">
              <Music className="text-muted-foreground h-6 w-6" />
            </div>
          )}
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">{meditation.title}</h3>
            {meditation.isFavorite && (
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            )}
          </div>
          
          <div className="flex items-center mt-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>{meditation.duration} min</span>
            <span className="mx-2">•</span>
            <span>{meditation.category}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
