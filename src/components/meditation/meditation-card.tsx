
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
  return (
    <Card 
      key={meditation.id} 
      className={cn(
        "overflow-hidden cursor-pointer hover:shadow-md transition-shadow animate-slide-in",
        isSelected ? "ring-2 ring-primary/50" : "neo-morphism"
      )}
      onClick={() => onClick(meditation)}
    >
      <div className="flex h-24">
        <div
          className="w-24 bg-cover bg-center"
          style={{ backgroundImage: `url(${meditation.coverImageUrl})` }}
        />
        <CardContent className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <h3 className="font-medium">{meditation.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {meditation.description}
            </p>
          </div>
          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {meditation.duration} min
            </div>
            <Button size="icon" variant="ghost" className="h-6 w-6">
              <Play className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
