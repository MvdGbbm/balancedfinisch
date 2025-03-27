
import React from "react";
import { Soundscape } from "@/lib/types";
import { MusicItemCard } from "./MusicItemCard";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";

interface MusicListProps {
  musicItems: Soundscape[];
  onEdit: (musicItem: Soundscape) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export const MusicList: React.FC<MusicListProps> = ({
  musicItems,
  onEdit,
  onDelete,
  onNew,
}) => {
  if (musicItems.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">
          Er zijn nog geen muziekstukken. Voeg je eerste muziekstuk toe!
        </p>
        <Button onClick={onNew}>
          <Music className="h-4 w-4 mr-2" />
          Nieuwe Muziek
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {musicItems.map((musicItem) => (
        <MusicItemCard 
          key={musicItem.id}
          musicItem={musicItem}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
