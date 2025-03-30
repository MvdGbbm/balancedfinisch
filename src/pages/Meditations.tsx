import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { MobileLayout } from "@/components/mobile-layout";
import { MeditationCategoryTabs } from "@/components/meditation/meditation-category-tabs";
import { MeditationDetailDialog } from "@/components/meditation/meditation-detail-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Meditation } from "@/lib/types";

const Meditations = () => {
  const { meditations, updateMeditation } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredMeditations = meditations.filter(meditation => {
    const categoryMatch = selectedCategory === "Alle" || meditation.category === selectedCategory;
    const searchMatch = meditation.title.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });
  
  const handleMeditationClick = (meditation: Meditation) => {
    setSelectedMeditation(meditation);
  };
  
  const handleFavoriteToggle = (meditation: Meditation) => {
    updateMeditation(meditation.id, {
      ...meditation,
      isFavorite: !meditation.isFavorite
    });
  };

  return (
    <MobileLayout>
      <section className="space-y-6 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="font-bold tracking-tight mb-2 text-2xl">
            Geleide Meditaties
          </h1>
          <p className="text-muted-foreground">
            Vind rust en balans met onze collectie meditaties
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Input
            type="search"
            placeholder="Zoek meditaties..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Search className="h-5 w-5 text-muted-foreground -ml-8" />
        </div>
        
        <MeditationCategoryTabs 
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        <div className="grid grid-cols-1 gap-4 pb-20">
          {filteredMeditations.map(meditation => (
            <Button
              key={meditation.id}
              variant="ghost"
              className="flex flex-col items-start rounded-lg border border-muted bg-background/50 px-4 py-3 text-left shadow-sm hover:bg-secondary/50"
              onClick={() => handleMeditationClick(meditation)}
            >
              <div className="font-medium">{meditation.title}</div>
              <div className="text-sm text-muted-foreground">
                {meditation.duration} minuten • {meditation.category}
              </div>
            </Button>
          ))}
          
          {filteredMeditations.length === 0 && (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                Geen meditaties gevonden in deze categorie.
              </p>
            </div>
          )}
        </div>
      </section>

      {selectedMeditation && (
        <MeditationDetailDialog
          isOpen={!!selectedMeditation}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedMeditation(null);
            }
          }}
          meditation={selectedMeditation}
          soundscapes={[]} 
          guidedMeditations={[]}
          onFavoriteToggle={handleFavoriteToggle}
        />
      )}
    </MobileLayout>
  );
};

export default Meditations;
