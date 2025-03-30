
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  CalendarPlus, 
  Clock, 
  Tag, 
  User,
  X 
} from "lucide-react";
import { Meditation, DailyQuote } from "@/lib/types";
import { AudioPlayer } from "@/components/audio-player";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

interface MeditationDetailDialogProps {
  meditation: Meditation | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MeditationDetailDialog: React.FC<MeditationDetailDialogProps> = ({
  meditation,
  isOpen,
  onOpenChange,
}) => {
  const { addPlannerEvent } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);

  if (!meditation) {
    return null;
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} uur ${remainingMinutes > 0 ? `${remainingMinutes} min` : ""}`;
  };

  const handleAddToPlanner = () => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    
    addPlannerEvent({
      title: meditation.title,
      date: dateStr,
      time: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`,
      duration: meditation.duration,
      completed: false,
      meditationId: meditation.id,
    });
    
    toast.success("Meditatie toegevoegd aan planner");
  };

  const handleClose = () => {
    setIsPlaying(false);
    onOpenChange(false);
  };

  // Create a generic meditation quote if none is provided
  const meditationQuote: DailyQuote = {
    id: "meditation-quote",
    text: "Adem diep in, en voel je lichaam ontspannen met elke uitademing.",
    author: "ZenMind"
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl overflow-hidden">
        <DialogHeader className="pb-1">
          <div className="absolute right-4 top-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Sluiten</span>
            </Button>
          </div>
          <DialogTitle className="text-2xl">{meditation.title}</DialogTitle>
          <DialogDescription className="flex items-center space-x-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatDuration(meditation.duration)}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <div 
              className="aspect-square rounded-lg overflow-hidden bg-cover bg-center"
              style={{ backgroundImage: `url(${meditation.coverImageUrl})` }}
            />
            
            <div className="mt-4 space-y-2">
              <div className="flex flex-wrap gap-1">
                {meditation.tags?.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={handleAddToPlanner}
                >
                  <CalendarPlus className="h-3.5 w-3.5 mr-1.5" />
                  Toevoegen aan planner
                </Button>
              </div>
              
              {(meditation.veraLink || meditation.marcoLink) && (
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Externe links:</h4>
                  <div className="flex flex-col space-y-2">
                    {meditation.veraLink && (
                      <a 
                        href={meditation.veraLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline flex items-center"
                      >
                        <User className="h-3 w-3 mr-1" /> 
                        Vera's versie
                      </a>
                    )}
                    
                    {meditation.marcoLink && (
                      <a 
                        href={meditation.marcoLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline flex items-center"
                      >
                        <User className="h-3 w-3 mr-1" /> 
                        Marco's versie
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="sm:col-span-2 space-y-4">
            <p className="text-sm text-muted-foreground">
              {meditation.description}
            </p>
            
            {meditation.audioUrl && (
              <div className="rounded-lg overflow-hidden border">
                <AudioPlayer
                  audioUrl={meditation.audioUrl}
                  title={meditation.title}
                  showTitle={false}
                  autoPlay={false}
                  loop={false}
                  quote={meditationQuote}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
