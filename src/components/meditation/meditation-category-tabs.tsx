
import React from "react";
import { 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { MeditationSubcategory } from "./meditation-subcategory";
import { Meditation } from "@/lib/types";

interface MeditationCategoryTabsProps {
  categories: string[];
  meditationsByCategory: Record<string, Meditation[]>;
  selectedMeditationId: string | null;
  getSubcategories: (meditations: Meditation[]) => Record<string, Meditation[]>;
  onSelectMeditation: (meditation: Meditation) => void;
}

export function MeditationCategoryTabs({
  categories,
  meditationsByCategory,
  selectedMeditationId,
  getSubcategories,
  onSelectMeditation
}: MeditationCategoryTabsProps) {
  return (
    <>
      <TabsList className="w-full h-auto flex flex-wrap justify-start mb-4 bg-background border overflow-x-auto">
        {categories.map((category) => (
          <TabsTrigger 
            key={category} 
            value={category}
            className="px-4 py-2 whitespace-nowrap"
          >
            {category}
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map((category) => {
        const meditationsInCategory = meditationsByCategory[category];
        const tagGroups = getSubcategories(meditationsInCategory);
        const subcategoryNames = Object.keys(tagGroups);
        
        return (
          <TabsContent key={category} value={category} className="space-y-4">
            {subcategoryNames.length > 0 ? (
              // Display subcategories as collapsible sections
              subcategoryNames.map((tag) => (
                <MeditationSubcategory
                  key={tag}
                  tag={tag}
                  meditations={tagGroups[tag]}
                  selectedMeditationId={selectedMeditationId}
                  onSelectMeditation={onSelectMeditation}
                />
              ))
            ) : (
              // If no subcategories, just list the meditations
              <div className="border rounded-lg overflow-hidden divide-y">
                {meditationsInCategory.map((meditation) => (
                  <MeditationItem
                    key={meditation.id}
                    meditation={meditation}
                    isSelected={selectedMeditationId === meditation.id}
                    onSelect={onSelectMeditation}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        );
      })}
    </>
  );
}
