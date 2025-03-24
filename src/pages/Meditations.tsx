
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
  const [selectedGuidedMeditation, setSelectedGuidedMeditation] = useState<Meditation | null>(null);
  
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
  
  // Get guided meditations - no tag filtering needed
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
  
  // Function to check if an audio source is available
  const isAudioSourceAvailable = (meditation: Meditation, source: 'vera' | 'marco'): boolean => {
    if (source === 'vera') {
      return !!(meditation.veraLink || meditation.audioUrl);
    } else {
      return !!meditation.marcoLink;
    }
  };
  
  const handleAudioSourceChange = (source: 'vera' | 'marco') => {
    console.log(`Changing audio source to: ${source}`);
    
    // Check if the selected audio source is available
    if (selectedGuidedMeditation && !isAudioSourceAvailable(selectedGuidedMeditation, source)) {
      toast.error(`${source === 'vera' ? 'Vera' : 'Marco'}'s versie is niet beschikbaar voor deze meditatie`);
      return;
    } else if (currentMeditationWithUrls && !isAudioSourceAvailable(currentMeditationWithUrls, source)) {
      toast.error(`${source === 'vera' ? 'Vera' : 'Marco'}'s versie is niet beschikbaar voor deze meditatie`);
      return;
    }
    
    setSelectedAudioSource(source);
    toast.success(`${source === 'vera' ? 'Vera' : 'Marco'} audio geselecteerd`);
  };
  
  const handleGuidedMeditationSelect = (meditation: Meditation) => {
    console.log("Selected guided meditation:", meditation);
    
    // Check if the selected audio source is available for this meditation
    if (!isAudioSourceAvailable(meditation, selectedAudioSource)) {
      // Try the other audio source
      const otherSource = selectedAudioSource === 'vera' ? 'marco' : 'vera';
      
      if (isAudioSourceAvailable(meditation, otherSource)) {
        toast.warning(`${selectedAudioSource === 'vera' ? 'Vera' : 'Marco'}'s versie is niet beschikbaar voor ${meditation.title}. ${otherSource === 'vera' ? 'Vera' : 'Marco'}'s versie wordt gebruikt.`);
        setSelectedAudioSource(otherSource);
      } else {
        toast.error(`Geen audio beschikbaar voor deze meditatie`);
        return;
      }
    }
    
    setSelectedGuidedMeditation(meditation);
    toast.success(`Geleide meditatie "${meditation.title}" geselecteerd`);
  };
  
  const getActiveAudioUrl = () => {
    if (selectedGuidedMeditation) {
      if (selectedAudioSource === 'vera') {
        return selectedGuidedMeditation.veraLink || selectedGuidedMeditation.audioUrl || '';
      } else if (selectedAudioSource === 'marco' && selectedGuidedMeditation.marcoLink) {
        return selectedGuidedMeditation.marcoLink || '';
      }
      return selectedGuidedMeditation.audioUrl || '';
    }
    
    if (!currentMeditationWithUrls) return '';
    
    if (selectedAudioSource === 'vera') {
      return currentMeditationWithUrls.veraLink || currentMeditationWithUrls.audioUrl || '';
    } else if (selectedAudioSource === 'marco') {
      return currentMeditationWithUrls.marcoLink || '';
    }
    
    return currentMeditationWithUrls.audioUrl || '';
  };
  
  useEffect(() => {
    // Log the current selection state when it changes
    if (currentMeditationWithUrls) {
      console.log("Current meditation:", currentMeditationWithUrls.title);
      console.log("Audio source:", selectedAudioSource);
      console.log("Active URL:", getActiveAudioUrl());
    }
  }, [currentMeditationWithUrls, selectedAudioSource]);
  
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
              onClick={(med) => {
                console.log("Selected meditation card:", med.title);
                setCurrentMeditation(med);
                setSelectedGuidedMeditation(null);
                
                // If neither audio source is available, show a message
                const veraAvailable = !!(med.veraLink || med.audioUrl);
                const marcoAvailable = !!med.marcoLink;
                
                if (!veraAvailable && !marcoAvailable) {
                  toast.warning(`Deze meditatie heeft geen audio beschikbaar.`);
                  return;
                }
                
                // Check if selected audio source is available
                if (selectedAudioSource === 'marco' && !marcoAvailable) {
                  if (veraAvailable) {
                    toast.warning(`Marco's versie is niet beschikbaar voor ${med.title}. Vera's versie wordt gebruikt.`);
                    setSelectedAudioSource('vera');
                  } else {
                    toast.error(`Geen audio beschikbaar voor deze meditatie`);
                  }
                } else if (selectedAudioSource === 'vera' && !veraAvailable) {
                  if (marcoAvailable) {
                    toast.warning(`Vera's versie is niet beschikbaar voor ${med.title}. Marco's versie wordt gebruikt.`);
                    setSelectedAudioSource('marco');
                  } else {
                    toast.error(`Geen audio beschikbaar voor deze meditatie`);
                  }
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
        guidedMeditations={guidedMeditations}
        onGuidedMeditationSelect={handleGuidedMeditationSelect}
      />
    </MobileLayout>
  );
};

export default Meditations;
