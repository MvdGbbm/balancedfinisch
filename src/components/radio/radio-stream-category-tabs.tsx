
import React from "react";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Meditation } from "@/lib/types";
import { RadioStreamItem } from "./radio-stream-item";

interface RadioStreamCategoryTabsProps {
  categories: string[];
  streamsByCategory: Record<string, Meditation[]>;
  selectedStreamId: string | null;
  onSelectStream: (stream: Meditation) => void;
}

export function RadioStreamCategoryTabs({ 
  categories, 
  streamsByCategory, 
  selectedStreamId,
  onSelectStream 
}: RadioStreamCategoryTabsProps) {
  
  if (categories.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Geen stream categorieën gevonden</p>
      </div>
    );
  }
  
  return (
    <>
      <TabsList className="mb-4 flex flex-wrap">
        {categories.map((category) => (
          <TabsTrigger key={category} value={category} className="flex-grow">
            {category}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {categories.map((category) => (
        <TabsContent key={category} value={category} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {streamsByCategory[category].map((stream) => (
              <RadioStreamItem 
                key={stream.id}
                stream={stream}
                isSelected={selectedStreamId === stream.id}
                onSelect={() => onSelectStream(stream)}
              />
            ))}
          </div>
        </TabsContent>
      ))}
    </>
  );
}
