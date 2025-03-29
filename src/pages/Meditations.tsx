
import React, { useState, useEffect, useRef } from "react";
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
import { validateAudioUrl } from "@/components/audio-player/utils";
import { MeditationErrorDisplay } from "@/components/meditation/meditation-error-display";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

const Meditations = () => {
  const { meditations, soundscapes, setCurrentMeditation, currentMeditation } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [processedMeditations, setProcessedMeditations] = useState<Meditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentSoundscapeId, setCurrentSoundscapeId] = useState<string | null>(null);
  const [selectedGuidedMeditation, setSelectedGuidedMeditation] = useState<Meditation | null>(null);
  const [activeTab, setActiveTab] = useState("meditations");
  const hasAttemptedLoad = useRef(false);
  
  // First time load
  useEffect(() => {
    const fetchAndProcessMeditations = async () => {
      if (meditations.length === 0) {
        // No meditations to process yet
        if (hasAttemptedLoad.current) {
          setLoadError("Geen meditaties gevonden om te laden. Controleer je verbinding en probeer het opnieuw.");
        }
        setLoading(false);
        return;
      }
      
      hasAttemptedLoad.current = true;
      setLoading(true);
      
      try {
        console.log("Starting to process meditation URLs...");
        const processed = await processMeditationUrls(meditations);
        
        // Filter out meditations with invalid URLs
        const validMeditations = processed.map(meditation => {
          if (meditation.audioUrl && meditation.audioUrl.includes('example.com')) {
            console.warn("Placeholder URL detected for meditation:", meditation.title);
            return {
              ...meditation,
              audioUrl: "" // Clear placeholder URLs
            };
          }
          return meditation;
        });
        
        setProcessedMeditations(validMeditations);
        setLoadError(null);
        console.log("Successfully processed meditation URLs");
      } catch (error) {
        console.error("Error processing meditations:", error);
        setLoadError("Er is een fout opgetreden bij het laden van meditaties. Probeer het later opnieuw.");
        toast.error("Er is een fout opgetreden bij het laden van meditaties");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAndProcessMeditations();
  }, [meditations]);
  
  // Get unique categories
  const categories = Array.from(
    new Set(processedMeditations.map((meditation) => meditation.category))
  ).filter(Boolean).sort();
  
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
      const url = selectedGuidedMeditation.audioUrl || '';
      return validateAudioUrl(url);
    }
    
    if (!currentMeditationWithUrls) return '';
    
    const url = currentMeditationWithUrls.audioUrl || '';
    return validateAudioUrl(url);
  };
  
  const handleGuidedMeditationSelect = (meditation: Meditation) => {
    setSelectedGuidedMeditation(meditation);
    
    // Validate URL before attempting to play
    const validUrl = validateAudioUrl(meditation.audioUrl || '');
    if (!validUrl) {
      toast.warning(`Deze meditatie heeft geen geldige audio URL.`);
    } else {
      console.log("Selected guided meditation:", meditation.title);
    }
  };
  
  const handleRetry = async () => {
    setIsRetrying(true);
    setLoadError(null);
    
    try {
      const processed = await processMeditationUrls(meditations);
      setProcessedMeditations(processed);
      toast.success("Meditaties opnieuw geladen");
    } catch (error) {
      console.error("Error retrying meditation load:", error);
      setLoadError("Kon meditaties niet opnieuw laden. Controleer je internetverbinding.");
      toast.error("Kon meditaties niet opnieuw laden");
    } finally {
      setIsRetrying(false);
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
        <div className="container py-6">
          <h1 className="text-2xl font-bold mb-6">Meditaties</h1>
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-muted-foreground">Meditaties laden...</p>
            <div className="w-full max-w-md space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }
  
  if (loadError) {
    return (
      <MobileLayout>
        <div className="container py-6">
          <h1 className="text-2xl font-bold mb-4">Meditaties</h1>
          <MeditationErrorDisplay 
            message={loadError}
            additionalDetails="Probeer opnieuw te laden of controleer je internetverbinding."
            onRetry={handleRetry}
            isRetrying={isRetrying}
          />
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
              {filteredMeditations.length > 0 ? (
                filteredMeditations.map((meditation) => (
                  <MeditationCard 
                    key={meditation.id}
                    meditation={meditation}
                    isSelected={currentMeditation?.id === meditation.id}
                    onClick={(med) => {
                      console.log("Selected meditation card:", med.title);
                      setCurrentMeditation(med);
                      setSelectedGuidedMeditation(null);
                      
                      if (!validateAudioUrl(med.audioUrl || '')) {
                        toast.warning(`Deze meditatie heeft geen geldige audio URL.`);
                        return;
                      }
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>Geen meditaties gevonden die aan je filters voldoen.</p>
                  {(selectedCategory || searchQuery) && (
                    <button 
                      className="text-primary underline mt-2"
                      onClick={handleClearFilters}
                    >
                      Wis filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="geleide-meditaties" className="mt-4">
            <div className="space-y-3 pb-20">
              {guidedMeditations.length > 0 ? (
                guidedMeditations.map((meditation) => (
                  <MeditationCard 
                    key={meditation.id}
                    meditation={meditation}
                    isSelected={currentMeditation?.id === meditation.id}
                    onClick={(med) => {
                      setCurrentMeditation(med);
                      setSelectedGuidedMeditation(null);
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>Geen geleide meditaties gevonden.</p>
                </div>
              )}
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
