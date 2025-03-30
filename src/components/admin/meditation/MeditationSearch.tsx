
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface MeditationSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const MeditationSearch = ({ searchQuery, onSearchChange }: MeditationSearchProps) => {
  return (
    <div className="relative w-64">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input 
        type="search"
        placeholder="Zoek meditaties..." 
        className="pl-9"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};
