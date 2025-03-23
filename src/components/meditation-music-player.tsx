
import React, { useState, useEffect } from "react";
import { AudioPlayer } from "@/components/audio-player";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Music, ChevronDown } from "lucide-react";
import { meditations } from "@/data/meditations";
import { Card } from "@/components/ui/card";

export function MeditationMusicPlayer() {
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Get all unique categories
  const categories = Array.from(
    new Set(meditations.map((meditation) => meditation.category))
  );

  // Set the first category as default if none selected
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  // Get all meditations for the selected category
  const filteredMeditations = meditations.filter(item => 
    item.category === selectedCategory
  );

  // If we have meditation music available for the selected category, set the first one as default
  useEffect(() => {
    if (filteredMeditations.length > 0 && !selectedMusic) {
      setSelectedMusic(filteredMeditations[0]);
      setIsPlayerVisible(true);
    }
  }, [filteredMeditations, selectedMusic]);

  const handleMusicSelect = (meditation) => {
    setSelectedMusic(meditation);
    setIsPlayerVisible(true);
  };

  return (
    <div className="w-full max-w-lg mx-auto mb-6">
      <Tabs 
        defaultValue={categories[0]} 
        value={selectedCategory} 
        onValueChange={setSelectedCategory}
        className="w-full"
      >
        <TabsList className="w-full h-auto flex flex-wrap justify-start gap-1 bg-background border mb-4 p-2 overflow-x-auto">
          {categories.map((category) => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="px-3 py-1 text-sm"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Music className="text-primary h-4 w-4" />
                <h3 className="text-sm font-medium">{category}</h3>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <span className="truncate max-w-[160px]">
                      {isPlayerVisible && selectedMusic && selectedMusic.category === category 
                        ? selectedMusic.title 
                        : "Kies muziek"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[220px] bg-popover/95 backdrop-blur-sm">
                  <DropdownMenuGroup>
                    {meditations.filter(item => item.category === category).length > 0 ? (
                      meditations.filter(item => item.category === category).map((meditation) => (
                        <DropdownMenuItem 
                          key={meditation.id}
                          onClick={() => handleMusicSelect(meditation)}
                          className="cursor-pointer"
                        >
                          <div>
                            <p className="font-medium">{meditation.title}</p>
                            <p className="text-xs text-muted-foreground">{meditation.duration} min</p>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>
                        Geen muziek beschikbaar voor deze categorie
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="space-y-3">
              {meditations.filter(item => item.category === category).map((meditation) => (
                <Card 
                  key={meditation.id} 
                  className={`p-3 cursor-pointer ${selectedMusic && selectedMusic.id === meditation.id ? 'border-primary' : ''}`}
                  onClick={() => handleMusicSelect(meditation)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{meditation.title}</h4>
                      <p className="text-xs text-muted-foreground">{meditation.duration} min</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMusicSelect(meditation);
                      }}
                    >
                      <Music className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {isPlayerVisible && selectedMusic && (
        <AudioPlayer 
          audioUrl={selectedMusic.audioUrl}
          title={selectedMusic.title}
          showTitle
          showControls
          className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg shadow-sm mt-4"
        />
      )}
    </div>
  );
}
