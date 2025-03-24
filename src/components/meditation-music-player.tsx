
import React, { useState, useEffect } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Music } from "lucide-react";
import { meditations } from "@/data/meditations";
import { useToast } from "@/hooks/use-toast";
import { Meditation } from "@/lib/types";
import { MeditationCategoryTabs } from "./meditation/meditation-category-tabs";
import { MeditationPlayerContainer } from "./meditation/meditation-player-container";

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
      
      // Log the available meditations for debugging
      console.log("Available meditations:", meditations);
      console.log("Setting default meditation:", firstMeditation);
      
      // Validate audio URL before setting
      if (firstMeditation && firstMeditation.audioUrl) {
        setSelectedMeditation(firstMeditation);
        setIsPlayerVisible(true);
      }
    }
  }, [categories, meditationsByCategory, selectedMeditation]);

  const handleMeditationSelect = (meditation: Meditation) => {
    console.log("Selected meditation:", meditation);
    
    // Validate the meditation has an audio URL
    if (!meditation.audioUrl) {
      toast({
        title: "Geen audio beschikbaar",
        description: "Deze meditatie heeft geen audio.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedMeditation(meditation);
    setIsPlayerVisible(true);
    toast({
      title: "Meditatie geselecteerd",
      description: `${meditation.title} is geselecteerd en klaar om af te spelen.`
    });
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
        <MeditationCategoryTabs 
          categories={categories}
          meditationsByCategory={meditationsByCategory}
          selectedMeditationId={selectedMeditation?.id || null}
          getSubcategories={getSubcategories}
          onSelectMeditation={handleMeditationSelect}
        />
      </Tabs>
      
      <MeditationPlayerContainer 
        isVisible={isPlayerVisible}
        selectedMeditation={selectedMeditation}
      />
    </div>
  );
}
