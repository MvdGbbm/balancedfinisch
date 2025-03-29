
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
import { Loader2 } from "lucide-react";

const Meditations = () => {
  const { meditations, soundscapes, setCurrentMeditation, currentMeditation } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [processedMeditations, setProcessedMeditations] = useState<Meditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentSoundscapeId, setCurrentSoundscapeId] = useState<string | null>(null);
  const [selectedGuidedMeditation, setSelectedGuidedMeditation] = useState<Meditation | null>(null);
  const [activeTab, setActiveTab] = useState("meditations");
  const processingAttempts = useRef(0);
  
  // First time load
  useEffect(() => {
    const fetchAndProcessMeditations = async () => {
      setLoading(true);
      try {
        console.log("Processing meditations, attempt:", processingAttempts.current + 1);
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
        setLoadError(false);
        processingAttempts.current = 0;
      } catch (error) {
        console.error("Error processing meditations:", error);
        processingAttempts.current += 1;
        
        if (processingAttempts.current <= 3) {
          console.log(`Retrying processing (${processingAttempts.current}/3)...`);
          // Auto-retry once with a delay
          setTimeout(() => {
            fetchAndProcessMeditations();
          }, 2000);
        } else {
          setLoadError(true);
          toast.error("Er is een fout opgetreden bij het laden van meditaties");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchAndProcessMeditations();
  }, [meditations]);
  
  // Get unique categories
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
    processingAttempts.current = 0;
    
    try {
      const processed = await processMeditationUrls(meditations);
      setProcessedMeditations(processed);
      setLoadError(false);
      toast.success("Meditaties opnieuw geladen");
    } catch (error) {
      console.error("Error retrying meditation load:", error);
      setLoadError(true);
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
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mb-4 mx-auto text-primary" />
            <p className="text-muted-foreground mb-2">Meditaties laden...</p>
            <p className="text-xs text-muted-foreground/70">Een moment geduld alstublieft</p>
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
            message="Er is een probleem opgetreden bij het laden van de meditaties. Controleer je internetverbinding en probeer het opnieuw."
            onRetry={handleRetry}
            isRetrying={isRetrying}
            details="De server reageert niet of er is een probleem met het ophalen van de meditaties."
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
                      
                      if (!validateAudioUrl(med.audioUrl || '') && 
                          !validateAudioUrl(med.veraLink || '') && 
                          !validateAudioUrl(med.marcoLink || '')) {
                        toast.warning(`Deze meditatie heeft geen geldige audio URL.`);
                        return;
                      }
                    }}
                  />
                ))
              ) : (
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
                  <p>Geen geleide meditaties beschikbaar.</p>
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
