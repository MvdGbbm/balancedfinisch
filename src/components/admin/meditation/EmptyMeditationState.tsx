
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyMeditationStateProps {
  searchQuery: string;
  onNewMeditation: () => void;
}

export const EmptyMeditationState = ({ 
  searchQuery, 
  onNewMeditation 
}: EmptyMeditationStateProps) => {
  return (
    <div className="text-center py-10">
      <p className="text-muted-foreground mb-4">
        {searchQuery 
          ? "Geen meditaties gevonden die aan je zoekopdracht voldoen." 
          : "Er zijn nog geen meditaties. Voeg je eerste meditatie toe!"}
      </p>
      {!searchQuery && (
        <Button onClick={onNewMeditation}>
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Meditatie
        </Button>
      )}
    </div>
  );
};
