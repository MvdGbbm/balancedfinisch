
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AdminMusicLink } from "./AdminMusicLink";

interface MusicHeaderProps {
  onCreateNew: () => void;
}

export const MusicHeader: React.FC<MusicHeaderProps> = ({ onCreateNew }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Muziek Beheer</h1>
        <p className="text-sm text-muted-foreground">
          Voeg nieuwe muziek toe en bewerk bestaande muziekstukken.
        </p>
      </div>
      <div className="flex space-x-2">
        <AdminMusicLink />
        <Button onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nieuwe muziek
        </Button>
      </div>
    </div>
  );
};
