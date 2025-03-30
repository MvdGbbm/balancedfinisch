
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, ListMusic } from "lucide-react";
import { MeditationSearch } from "./MeditationSearch";

interface MeditationHeaderProps {
  onNewMeditation: () => void;
  onOpenCategoryDialog: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const MeditationHeader = ({
  onNewMeditation,
  onOpenCategoryDialog,
  searchQuery,
  onSearchChange
}: MeditationHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meditaties Beheren</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onOpenCategoryDialog}>
            <ListMusic className="h-4 w-4 mr-2" />
            Categorieën
          </Button>
          <Button onClick={onNewMeditation}>
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe Meditatie
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          Voeg nieuwe meditaties toe of bewerk bestaande content
        </p>
        <MeditationSearch 
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
      </div>
    </div>
  );
};
