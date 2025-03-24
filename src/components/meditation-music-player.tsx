import React, { useState, useEffect } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Music, Square } from "lucide-react";
import { meditations } from "@/data/meditations";
import { useToast } from "@/hooks/use-toast";
import { Meditation } from "@/lib/types";
import { MeditationCategoryTabs } from "./meditation/meditation-category-tabs";
import { MeditationPlayerContainer } from "./meditation/meditation-player-container";
import { Button } from "./ui/button";

export function MeditationMusicPlayer() {
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const { toast } = useToast();

  // Group meditations by category
  const meditationsByCategory = meditations.reduce((acc, meditation) => {
    if (!acc[meditation.category]) {
      acc[meditation.category] = [];
    }
    acc[meditation.category].push(meditation);
    return acc;
  }, {} as Record<string, Meditation[]>);
  
  // Get unique categories
  const categories = Object.keys(meditationsByCategory);

  // Set first meditation as default if none selected
  useEffect(() => {
    if (!selectedMeditation && categories.length > 0) {
      const firstCategory = categories[0];
      const firstMeditation = meditationsByCategory[firstCategory][0];
      setSelectedMeditation(firstMeditation);
    }
  }, [categories, meditationsByCategory, selectedMeditation]);

  const handleMeditationSelect = (meditation: Meditation) => {
    // If the same meditation is already playing, stop it
    if (selectedMeditation?.id === meditation.id && isPlayerVisible) {
      setIsPlayerVisible(false);
      toast({
        title: "Meditatie gestopt",
        description: `${meditation.title} is gestopt.`
      });
    } else {
      // Otherwise play the selected meditation
      setSelectedMeditation(meditation);
      setIsPlayerVisible(true);
      toast({
        title: "Meditatie geselecteerd",
        description: `${meditation.title} is geselecteerd en klaar om af te spelen.`
      });
    }
  };

  const handleStopPlaying = () => {
    if (isPlayerVisible) {
      setIsPlayerVisible(false);
      toast({
        title: "Meditatie gestopt",
        description: "Het afspelen is gestopt."
      });
    }
  };

  // Group meditations for display, without depending on tags
  const getSubcategories = (meditationsInCategory: Meditation[]) => {
    // For guided meditations, just display all of them without subcategories
    if (meditationsInCategory.some(m => m.category === "Geleide Meditaties")) {
      return { "Alle geleide meditaties": meditationsInCategory };
    }
    
    // For other categories, if they have tags, use those for subcategories
    const tagGroups: Record<string, Meditation[]> = {};
    
    meditationsInCategory.forEach(meditation => {
      if (meditation.tags && meditation.tags.length > 0) {
        meditation.tags.forEach(tag => {
          if (!tagGroups[tag]) {
            tagGroups[tag] = [];
          }
          // Check if meditation is already in this tag group
          if (!tagGroups[tag].some(m => m.id === meditation.id)) {
            tagGroups[tag].push(meditation);
          }
        });
      } else {
        // For meditations without tags, add to "Overig"
        if (!tagGroups["Overig"]) {
          tagGroups["Overig"] = [];
        }
        if (!tagGroups["Overig"].some(m => m.id === meditation.id)) {
          tagGroups["Overig"].push(meditation);
        }
      }
    });
    
    // If no tags were used at all, just show all meditations
    if (Object.keys(tagGroups).length === 0) {
      return { "Alle meditaties": meditationsInCategory };
    }
    
    return tagGroups;
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Music className="text-primary h-5 w-5" />
        <h2 className="text-lg font-medium">Meditaties</h2>
      </div>
      
      <Tabs defaultValue={categories[0]} className="w-full">
        {isPlayerVisible && selectedMeditation && (
          <div className="mb-4 bg-muted/30 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">
                Speelt nu: <span className="text-primary">{selectedMeditation.title}</span>
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleStopPlaying}
                className="h-8 w-8 p-0"
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
            
            <MeditationPlayerContainer 
              isVisible={isPlayerVisible}
              selectedMeditation={selectedMeditation}
              hideErrorMessage={false}
            />
          </div>
        )}
        
        <MeditationCategoryTabs 
          categories={categories}
          meditationsByCategory={meditationsByCategory}
          selectedMeditationId={selectedMeditation?.id || null}
          getSubcategories={getSubcategories}
          onSelectMeditation={handleMeditationSelect}
        />
      </Tabs>
    </div>
  );
}
