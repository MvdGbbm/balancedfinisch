
import React from "react";
import { 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { MeditationSubcategory } from "./meditation-subcategory";
import { MeditationItem } from "./meditation-item";
import { Meditation } from "@/lib/types";

interface MeditationCategoryTabsProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string) => void;
}

export function MeditationCategoryTabs({
  categories,
  selectedCategory,
  onCategoryChange
}: MeditationCategoryTabsProps) {
  return (
    <div className="w-full h-auto flex flex-wrap justify-start mb-4 bg-background border overflow-x-auto">
      <button 
        key="all" 
        className={`px-4 py-2 whitespace-nowrap ${selectedCategory === 'Alle' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
        onClick={() => onCategoryChange('Alle')}
      >
        Alle Meditaties
      </button>
      
      {categories.map((category) => (
        <button 
          key={category} 
          className={`px-4 py-2 whitespace-nowrap ${selectedCategory === category ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
