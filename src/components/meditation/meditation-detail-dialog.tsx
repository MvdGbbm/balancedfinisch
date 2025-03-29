
import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Heart, Clock, Volume2, Calendar } from "lucide-react";
import { Meditation } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { getRandomQuote } from "@/components/audio-player/utils";
import { AudioPlayer, AudioPlayerHandle } from "@/components/audio-player";

interface MeditationDetailDialogProps {
  meditation: Meditation | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFavoriteToggle?: (meditation: Meditation) => void;
}

export const MeditationDetailDialog: React.FC<MeditationDetailDialogProps> = ({
  meditation,
  isOpen,
  onOpenChange,
  onFavoriteToggle
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Get a new random quote when the dialog opens or meditation changes
  useEffect(() => {
    if (isOpen && meditation) {
      setCurrentQuote(getRandomQuote(meditation.quotes || []));
    }
    
    // Clean up when dialog closes
    return () => {
      setIsPlaying(false);
    };
  }, [isOpen, meditation]);
  
  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Format the date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Handle play button click
  const handlePlayClick = () => {
    setIsPlaying(true);
  };
  
  if (!meditation) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-background">
        <div className="relative h-40 bg-gradient-to-b from-primary/20 to-background/50">
          {meditation.coverImageUrl && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-50" 
              style={{ backgroundImage: `url(${meditation.coverImageUrl})` }}
            />
          )}
          
          <div className="absolute bottom-4 left-6 right-6">
            <DialogTitle className="text-2xl font-bold text-foreground mb-1">
              {meditation.title}
            </DialogTitle>
            <DialogDescription className="text-foreground/80">
              {meditation.subtitle}
            </DialogDescription>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {meditation.durationSeconds 
                ? formatTime(meditation.durationSeconds) 
                : "Onbekende duur"}
            </Badge>
            
            <Badge variant="outline" className="bg-primary/10">
              {meditation.category}
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(meditation.createdAt)}
            </Badge>
            
            {meditation.tags?.map(tag => (
              <Badge key={tag} variant="secondary" className="bg-muted">
                {tag}
              </Badge>
            ))}
          </div>
          
          <p className="text-muted-foreground mb-6">
            {meditation.description}
          </p>
          
          {meditation.quotes && meditation.quotes.length > 0 && currentQuote && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/50 italic text-center">
              "{currentQuote}"
            </div>
          )}
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Volume2 className="mr-2 h-5 w-5 text-primary" />
              Audio
            </h3>
            
            <AudioPlayer 
              audioUrl={meditation.audioUrl} 
              showControls
              title={meditation.title}
              isPlayingExternal={isPlaying}
              onPlayPauseChange={setIsPlaying}
              showQuote
              ref={audioRef as React.Ref<AudioPlayerHandle>}
            />
          </div>
        </div>
        
        <DialogFooter className="p-6 pt-0 flex justify-between">
          {onFavoriteToggle && (
            <Button 
              variant="outline"
              className={cn(
                "gap-2",
                meditation.isFavorite && "text-red-500 border-red-200 hover:text-red-600"
              )}
              onClick={() => onFavoriteToggle(meditation)}
            >
              <Heart className="h-4 w-4" fill={meditation.isFavorite ? "currentColor" : "none"} />
              {meditation.isFavorite ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
            </Button>
          )}
          
          <Button onClick={() => onOpenChange(false)}>
            Sluiten
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
