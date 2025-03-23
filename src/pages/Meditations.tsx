
import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { useApp } from "@/context/AppContext";
import { MeditationCard } from "@/components/meditation/meditation-card";
import { MeditationFilters } from "@/components/meditation/meditation-filters";
import { MeditationDetailDialog } from "@/components/meditation/meditation-detail-dialog";
import { processMeditationUrls, filterMeditations } from "@/utils/meditation-utils";
import { Meditation } from "@/lib/types";
import { toast } from "sonner";

const Meditations = () => {
  const { meditations, soundscapes, setCurrentMeditation, currentMeditation } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [processedMeditations, setProcessedMeditations] = useState<Meditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSoundscapeId, setCurrentSoundscapeId] = useState<string | null>(null);
  const [selectedAudioSource, setSelectedAudioSource] = useState<'vera' | 'marco'>('vera');
  
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
  
  const handleAudioSourceChange = (source: 'vera' | 'marco') => {
    setSelectedAudioSource(source);
    toast.success(`${source === 'vera' ? 'Vera' : 'Marco'} audio geselecteerd`);
  };
  
  const getActiveAudioUrl = () => {
    if (!currentMeditationWithUrls) return '';
    
    if (selectedAudioSource === 'vera' && currentMeditationWithUrls.veraLink) {
      return currentMeditationWithUrls.veraLink;
    } else if (selectedAudioSource === 'marco' && currentMeditationWithUrls.marcoLink) {
      return currentMeditationWithUrls.marcoLink;
    }
    
    return currentMeditationWithUrls.audioUrl;
  };
  
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
              onClick={setCurrentMeditation}
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
      </div>
      
      <MeditationDetailDialog 
        meditation={currentMeditationWithUrls}
        soundscapes={soundscapes}
        isOpen={currentMeditation !== null}
        onOpenChange={(open) => !open && setCurrentMeditation(null)}
        selectedAudioSource={selectedAudioSource}
        currentSoundscapeId={currentSoundscapeId}
        onAudioSourceChange={handleAudioSourceChange}
        onSoundscapeChange={handleSoundscapeChange}
        getActiveAudioUrl={getActiveAudioUrl}
      />
    </MobileLayout>
  );
};

export default Meditations;
