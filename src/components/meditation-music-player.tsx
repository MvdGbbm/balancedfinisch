
import React, { useState, useEffect } from "react";
import { AudioPlayer } from "@/components/audio-player";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Music, ChevronDown, ChevronRight, Play } from "lucide-react";
import { meditations } from "@/data/meditations";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function MeditationMusicPlayer() {
  const [selectedMeditation, setSelectedMeditation] = useState(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const { toast } = useToast();

  // Group meditations by category
  const meditationsByCategory = meditations.reduce((acc, meditation) => {
    if (!acc[meditation.category]) {
      acc[meditation.category] = [];
    }
    acc[meditation.category].push(meditation);
    return acc;
  }, {});

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

  const handleMeditationSelect = (meditation) => {
    setSelectedMeditation(meditation);
    setIsPlayerVisible(true);
    toast({
      title: "Meditatie geselecteerd",
      description: `${meditation.title} is geselecteerd en klaar om af te spelen.`
    });
  };

  // Group meditations by subcategory if they have tags
  const getSubcategories = (meditationsInCategory) => {
    const subcategoriesMap = {};
    
    // Group by first tag as subcategory
    meditationsInCategory.forEach(meditation => {
      const subcategory = meditation.tags && meditation.tags.length > 0 
        ? meditation.tags[0] 
        : "Overig"; // Default subcategory if no tags
        
      if (!subcategoriesMap[subcategory]) {
        subcategoriesMap[subcategory] = [];
      }
      subcategoriesMap[subcategory].push(meditation);
    });
    
    return subcategoriesMap;
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Music className="text-primary h-5 w-5" />
        <h2 className="text-lg font-medium">Meditaties</h2>
      </div>
      
      <Tabs defaultValue={categories[0]} className="w-full">
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
          const subcategories = getSubcategories(meditationsInCategory);
          const subcategoryNames = Object.keys(subcategories);
          
          return (
            <TabsContent key={category} value={category} className="space-y-4">
              {subcategoryNames.length > 1 ? (
                // If we have subcategories, display as collapsible sections
                subcategoryNames.map((subcategory) => (
                  <Collapsible 
                    key={subcategory}
                    className="border rounded-lg overflow-hidden"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50">
                      <span className="font-medium">{subcategory}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="divide-y">
                        {subcategories[subcategory].map((meditation) => (
                          <MeditationItem
                            key={meditation.id}
                            meditation={meditation}
                            isSelected={selectedMeditation?.id === meditation.id}
                            onSelect={handleMeditationSelect}
                          />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))
              ) : (
                // If no subcategories, just list the meditations
                <div className="border rounded-lg overflow-hidden divide-y">
                  {meditationsInCategory.map((meditation) => (
                    <MeditationItem
                      key={meditation.id}
                      meditation={meditation}
                      isSelected={selectedMeditation?.id === meditation.id}
                      onSelect={handleMeditationSelect}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
      
      {isPlayerVisible && selectedMeditation && (
        <div className="mt-4">
          <AudioPlayer 
            audioUrl={selectedMeditation.audioUrl}
            title={selectedMeditation.title}
            showTitle
            showControls
            className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg shadow-sm"
          />
        </div>
      )}
    </div>
  );
}

// Component for individual meditation items
function MeditationItem({ meditation, isSelected, onSelect }) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors",
        isSelected && "bg-primary/10"
      )}
      onClick={() => onSelect(meditation)}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded bg-cover bg-center" 
          style={{ backgroundImage: `url(${meditation.coverImageUrl})` }}
        />
        <div>
          <h3 className="font-medium line-clamp-1">{meditation.title}</h3>
          <p className="text-xs text-muted-foreground">{meditation.duration} min</p>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-primary"
      >
        <Play className="h-4 w-4" />
      </Button>
    </div>
  );
}
