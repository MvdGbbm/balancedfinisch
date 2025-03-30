
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface MusicSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const MusicSearch: React.FC<MusicSearchProps> = ({ 
  searchQuery, 
  setSearchQuery 
}) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Zoek op titel, beschrijving of tags..."
        className="w-full pl-8"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};
