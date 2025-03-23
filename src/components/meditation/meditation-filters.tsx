
import React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MeditationFiltersProps {
  categories: string[];
  selectedCategory: string | null;
  searchQuery: string;
  showFilters: boolean;
  onCategoryChange: (category: string) => void;
  onSearchChange: (search: string) => void;
  onToggleFilters: () => void;
  onClearFilters: () => void;
}

export const MeditationFilters = ({
  categories,
  selectedCategory,
  searchQuery,
  showFilters,
  onCategoryChange,
  onSearchChange,
  onToggleFilters,
  onClearFilters
}: MeditationFiltersProps) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meditaties</h1>
        <Button 
          variant="outline" 
          size="icon"
          onClick={onToggleFilters}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="w-full">
        <Select
          value={selectedCategory || "all"}
          onValueChange={onCategoryChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Kies een categorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Alle Meditaties</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      {showFilters && (
        <div className="space-y-3 animate-slide-in">
          <Input
            placeholder="Zoek een meditatie..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onCategoryChange(
                  selectedCategory === category ? "all" : category
                )}
              >
                {category}
              </Badge>
            ))}
            
            {(selectedCategory || searchQuery) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClearFilters}
                className="ml-auto flex items-center gap-1 h-5 text-xs"
              >
                <X className="h-3 w-3" /> Wis filters
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
