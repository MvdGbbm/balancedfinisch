
import React, { useState, useEffect } from "react";
import { AudioPlayer } from "@/components/audio-player";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { 
  Collapsible, CollapsibleContent, CollapsibleTrigger
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Music, ChevronDown, ChevronUp, Play, Clock, PlayCircle
} from "lucide-react";
import { meditations } from "@/data/meditations";
import { toast } from "sonner";

export function MeditationMusicPlayer() {
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [openTagSections, setOpenTagSections] = useState({});

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
    item.category === selectedCategory && 
    (selectedTag ? item.tags.includes(selectedTag) : true)
  );

  // Get unique tags for the selected category
  const categoryTags = Array.from(
    new Set(
      meditations
        .filter(item => item.category === selectedCategory)
        .flatMap(item => item.tags)
    )
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
    toast.success(`Nu afspelen: ${meditation.title}`);
  };

  const toggleTagSection = (tag) => {
    setOpenTagSections(prev => ({
      ...prev,
      [tag]: !prev[tag]
    }));
  };

  const handleTagSelect = (tag) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  return (
    <div className="w-full max-w-lg mx-auto mb-6 p-4">
      <h2 className="text-xl font-bold mb-4">Meditatie Bibliotheek</h2>
      
      <Tabs 
        defaultValue={categories[0]} 
        value={selectedCategory} 
        onValueChange={(value) => {
          setSelectedCategory(value);
          setSelectedTag(null);
        }}
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
            </div>

            {/* Tags/Subcategories filter */}
            {categoryTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {categoryTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagSelect(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
                {selectedTag && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTag(null)}
                    className="text-xs"
                  >
                    Toon alles
                  </Button>
                )}
              </div>
            )}
            
            {/* Group meditations by tags */}
            {!selectedTag && categoryTags.length > 0 ? (
              <div className="space-y-2">
                {categoryTags.map(tag => {
                  const tagMeditations = meditations.filter(
                    m => m.category === category && m.tags.includes(tag)
                  );
                  const isOpen = openTagSections[tag];
                  
                  return (
                    <Collapsible
                      key={tag}
                      open={isOpen}
                      onOpenChange={() => toggleTagSection(tag)}
                      className="border rounded-lg p-3 bg-card/30"
                    >
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-2">
                            <PlayCircle className="h-4 w-4 text-primary" />
                            <h4 className="font-medium capitalize">{tag}</h4>
                            <Badge variant="outline" size="sm" className="text-xs">
                              {tagMeditations.length}
                            </Badge>
                          </div>
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 space-y-2">
                        {tagMeditations.map(meditation => (
                          <Card 
                            key={meditation.id} 
                            className={`p-0 cursor-pointer ${selectedMusic?.id === meditation.id ? 'border-primary' : ''}`}
                            onClick={() => handleMusicSelect(meditation)}
                          >
                            <div className="flex h-20">
                              <div
                                className="w-20 bg-cover bg-center"
                                style={{ backgroundImage: `url(${meditation.coverImageUrl})` }}
                              />
                              <div className="flex-1 p-3 flex flex-col justify-between">
                                <h5 className="font-medium text-sm">{meditation.title}</h5>
                                <div className="flex justify-between items-center mt-1">
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {meditation.duration} min
                                  </div>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6"
                                  >
                                    <Play className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMeditations.map((meditation) => (
                  <Card 
                    key={meditation.id} 
                    className={`p-0 cursor-pointer ${selectedMusic?.id === meditation.id ? 'border-primary' : ''}`}
                    onClick={() => handleMusicSelect(meditation)}
                  >
                    <div className="flex h-20">
                      <div
                        className="w-20 bg-cover bg-center"
                        style={{ backgroundImage: `url(${meditation.coverImageUrl})` }}
                      />
                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <h5 className="font-medium text-sm">{meditation.title}</h5>
                        <div className="flex justify-between items-center mt-1">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {meditation.duration} min
                          </div>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6"
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {filteredMeditations.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <p>Geen meditaties gevonden in deze categorie.</p>
              </div>
            )}
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
