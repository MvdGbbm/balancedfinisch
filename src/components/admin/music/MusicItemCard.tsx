
import React from "react";
import { Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { Soundscape } from "@/lib/types";

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
  return (
    <Card className="overflow-hidden border-muted bg-background/30 backdrop-blur-sm">
      <div className="aspect-video bg-cover bg-center relative">
        <img 
          src={musicItem.coverImageUrl} 
          alt={musicItem.title}
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-medium">{musicItem.title}</h3>
          <p className="text-white/80 text-sm truncate">
            {musicItem.description}
          </p>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <Button 
            variant="secondary" 
            size="icon"
            className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
            onClick={() => onEdit(musicItem)}
          >
            <Edit className="h-4 w-4 text-white" />
          </Button>
          <Button 
            variant="destructive" 
            size="icon"
            className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
            onClick={() => onDelete(musicItem.id)}
          >
            <Trash2 className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
      <CardFooter className="p-3 bg-background/50 backdrop-blur-sm">
        <AudioPlayer audioUrl={musicItem.audioUrl} showControls={false} />
      </CardFooter>
    </Card>
  );
};
