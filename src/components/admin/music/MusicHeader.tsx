
import React from "react";
import { Button } from "@/components/ui/button";
import { ListFilter, Music, PlusCircle, Trash } from "lucide-react";

interface MusicHeaderProps {
  onCreateClick: () => void;
  onManageCategoriesClick: () => void;
}

export const MusicHeader = ({ onCreateClick, onManageCategoriesClick }: MusicHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="icon-container-pink">
            <Music className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Muziek</h2>
        </div>
        <p className="text-muted-foreground">
          Beheer ontspannende muziek voor de app.
        </p>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" onClick={onManageCategoriesClick} className="border-accent-blue/30 text-accent-blue hover:bg-accent-blue/10 hover:text-accent-blue">
          <ListFilter className="mr-2 h-4 w-4" />
          Categorieën
        </Button>
        <Button onClick={onCreateClick} className="bg-accent-pink text-white hover:bg-accent-pink/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nieuwe Muziek
        </Button>
      </div>
    </div>
  );
};
