
import React from "react";
import { Music } from "lucide-react";

interface EmptyMusicStateProps {
  searchQuery: string;
}

export const EmptyMusicState = ({ searchQuery }: EmptyMusicStateProps) => {
  return (
    <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
      <Music className="h-8 w-8 text-muted-foreground" />
      <h3 className="text-lg font-medium">Geen muziek gevonden</h3>
      <p className="text-sm text-muted-foreground">
        {searchQuery
          ? "Probeer een andere zoekopdracht."
          : "Er is nog geen muziek toegevoegd. Klik op 'Nieuwe Muziek' om te beginnen."}
      </p>
    </div>
  );
};
