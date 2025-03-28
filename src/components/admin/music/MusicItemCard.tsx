
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Play, Pause, Volume2 } from "lucide-react";
import { AudioPreview } from "@/components/audio-player/audio-preview";
import { Soundscape } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface MusicItemCardProps {
  musicItem: Soundscape;
  onEdit: (musicItem: Soundscape) => void;
  onDelete: (id: string) => void;
}

export const MusicItemCard: React.FC<MusicItemCardProps> = ({
  musicItem,
  onEdit,
  onDelete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <Card className="overflow-hidden border-muted bg-background/50 backdrop-blur-sm hover:shadow-md transition-all">
      <div className="flex items-start p-3">
        <div 
          className="w-16 h-16 rounded-md overflow-hidden mr-3 flex-shrink-0 bg-muted"
          style={{ backgroundImage: `url(${musicItem.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="w-full h-full bg-black/30 flex items-center justify-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-10 w-10 text-white hover:text-white hover:bg-black/20"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-medium truncate">{musicItem.title}</h3>
            <div className="flex gap-1 ml-2 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7"
                onClick={() => onEdit(musicItem)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={() => onDelete(musicItem.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-1 mb-1">
            {musicItem.description}
          </p>
          
          <div className="flex flex-wrap gap-1 mt-1">
            {musicItem.tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs px-1.5 py-0 h-5 bg-primary/10">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      <CardFooter className="p-0 border-t">
        <AudioPreview 
          url={musicItem.audioUrl} 
          autoPlay={isPlaying}
          onEnded={() => setIsPlaying(false)}
          showControls={true}
        />
      </CardFooter>
    </Card>
  );
};
