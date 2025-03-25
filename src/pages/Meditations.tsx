
import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { useApp } from "@/context/AppContext";
import { MeditationCard } from "@/components/meditation/meditation-card";
import { MeditationFilters } from "@/components/meditation/meditation-filters";
import { MeditationDetailDialog } from "@/components/meditation/meditation-detail-dialog";
import { processMeditationUrls, filterMeditations } from "@/utils/meditation-utils";
import { Meditation } from "@/lib/types";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalMeditationMusic } from "@/components/meditation/personal-meditation-music";

const Meditations = () => {
  const { meditations, soundscapes, setCurrentMeditation, currentMeditation } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [processedMeditations, setProcessedMeditations] = useState<Meditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSoundscapeId, setCurrentSoundscapeId] = useState<string | null>(null);
  const [selectedGuidedMeditation, setSelectedGuidedMeditation] = useState<Meditation | null>(null);
  const [activeTab, setActiveTab] = useState("meditations");
  
  useEffect(() => {
    const fetchAndProcessMeditations = async () => {
      setLoading(true);
      const processed = await processMeditationUrls(meditations);
      setProcessedMeditations(processed);
      setLoading(false);
    };
    
    fetchAndProcessMeditations();
  }, [meditations]);
  
  const categories = Array.from(
    new Set(processedMeditations.map((meditation) => meditation.category))
  );
  
  const filteredMeditations = filterMeditations(processedMeditations, searchQuery, selectedCategory);
  
  const guidedMeditations = processedMeditations.filter(
    meditation => meditation.category === "Geleide Meditaties"
  );
  
  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery("");
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === "all" ? null : category);
  };
  
  const currentMeditationWithUrls = currentMeditation
    ? processedMeditations.find(m => m.id === currentMeditation.id) || currentMeditation
    : null;
    
  const handleSoundscapeChange = (soundscapeId: string) => {
    setCurrentSoundscapeId(soundscapeId);
  };
  
  const getActiveAudioUrl = () => {
    if (selectedGuidedMeditation) {
      return selectedGuidedMeditation.audioUrl || '';
    }
    
    if (!currentMeditationWithUrls) return '';
    
    return currentMeditationWithUrls.audioUrl || '';
  };
  
  const handleGuidedMeditationSelect = (meditation: Meditation) => {
    setSelectedGuidedMeditation(meditation);
    if (meditation.audioUrl) {
      console.log("Selected guided meditation:", meditation.title);
    } else {
      toast.warning(`Deze meditatie heeft geen audio beschikbaar.`);
    }
  };
  
  useEffect(() => {
    if (currentMeditationWithUrls) {
      console.log("Current meditation:", currentMeditationWithUrls.title);
      console.log("Active URL:", getActiveAudioUrl());
    }
  }, [currentMeditationWithUrls]);
  
  if (loading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Meditaties laden...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }
  
  return (
    <MobileLayout>
      <div className="space-y-4 animate-fade-in">
        <Tabs defaultValue="meditations" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto flex overflow-x-auto bg-background border">
            <TabsTrigger value="meditations" className="flex-1">Meditaties</TabsTrigger>
            <TabsTrigger value="geleide-meditaties" className="flex-1">Geleide Meditaties</TabsTrigger>
            <TabsTrigger value="slaap" className="flex-1">Slaap</TabsTrigger>
            <TabsTrigger value="focus" className="flex-1">Focus</TabsTrigger>
            <TabsTrigger value="persoonlijke-muziek" className="flex-1">Persoonlijke meditatie muziek</TabsTrigger>
          </TabsList>
          
          <TabsContent value="meditations" className="mt-4">
            <MeditationFilters 
              categories={categories}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              showFilters={showFilters}
              onCategoryChange={handleCategoryChange}
              onSearchChange={setSearchQuery}
              onToggleFilters={() => setShowFilters(!showFilters)}
              onClearFilters={handleClearFilters}
            />
            
            <div className="space-y-3 pb-20">
              {filteredMeditations.map((meditation) => (
                <MeditationCard 
                  key={meditation.id}
                  meditation={meditation}
                  isSelected={currentMeditation?.id === meditation.id}
                  onClick={(med) => {
                    console.log("Selected meditation card:", med.title);
                    setCurrentMeditation(med);
                    setSelectedGuidedMeditation(null);
                    
                    if (!med.audioUrl) {
                      toast.warning(`Deze meditatie heeft geen audio beschikbaar.`);
                      return;
                    }
                  }}
                />
              ))}
              
              {filteredMeditations.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  <p>Geen meditaties gevonden die aan je filters voldoen.</p>
                  <button 
                    className="text-primary underline mt-2"
                    onClick={handleClearFilters}
                  >
                    Wis filters
                  </button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="geleide-meditaties" className="mt-4">
            <div className="space-y-3 pb-20">
              {guidedMeditations.map((meditation) => (
                <MeditationCard 
                  key={meditation.id}
                  meditation={meditation}
                  isSelected={currentMeditation?.id === meditation.id}
                  onClick={(med) => {
                    setCurrentMeditation(med);
                    setSelectedGuidedMeditation(null);
                  }}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="slaap" className="mt-4">
            <div className="text-center py-10 text-muted-foreground">
              <p>Slaap meditaties komen binnenkort beschikbaar.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="focus" className="mt-4">
            <div className="text-center py-10 text-muted-foreground">
              <p>Focus meditaties komen binnenkort beschikbaar.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="persoonlijke-muziek" className="mt-4">
            <PersonalMeditationMusic />
          </TabsContent>
        </Tabs>
      </div>
      
      <MeditationDetailDialog 
        meditation={currentMeditationWithUrls}
        soundscapes={soundscapes}
        isOpen={currentMeditation !== null}
        onOpenChange={(open) => !open && setCurrentMeditation(null)}
        currentSoundscapeId={currentSoundscapeId}
        onSoundscapeChange={handleSoundscapeChange}
        guidedMeditations={guidedMeditations}
        onGuidedMeditationSelect={handleGuidedMeditationSelect}
      />
    </MobileLayout>
  );
};

export default Meditations;
