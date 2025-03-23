import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AudioPlayer } from "@/components/audio-player";
import { MixerPanel } from "@/components/mixer-panel";
import { Button } from "@/components/ui/button";
import { Clock, Play, Filter, X } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
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
  
  useEffect(() => {
    const processUrls = async () => {
      try {
        setLoading(true);
        console.log("Processing meditation URLs...");
        
        const processed = await Promise.all(
          meditations.map(async (meditation) => {
            let audioUrl = meditation.audioUrl;
            let coverImageUrl = meditation.coverImageUrl;
            
            if (!audioUrl.startsWith('http')) {
              try {
                const { data: audioData } = await supabase.storage
                  .from('meditations')
                  .getPublicUrl(audioUrl);
                audioUrl = audioData.publicUrl;
                console.log(`Loaded audio URL for ${meditation.title}:`, audioUrl);
              } catch (error) {
                console.error(`Error processing audio URL for ${meditation.title}:`, error);
                toast.error(`Kon audio niet laden voor ${meditation.title}`);
              }
            }
            
            if (!coverImageUrl.startsWith('http')) {
              try {
                const { data: imageData } = await supabase.storage
                  .from('meditations')
                  .getPublicUrl(coverImageUrl);
                coverImageUrl = imageData.publicUrl;
                console.log(`Loaded image URL for ${meditation.title}:`, coverImageUrl);
              } catch (error) {
                console.error(`Error processing cover image URL for ${meditation.title}:`, error);
                toast.error(`Kon afbeelding niet laden voor ${meditation.title}`);
              }
            }
            
            return {
              ...meditation,
              audioUrl,
              coverImageUrl
            };
          })
        );
        
        console.log("Processed meditations:", processed);
        setProcessedMeditations(processed);
      } catch (error) {
        console.error("Error in processUrls:", error);
        toast.error("Er is een fout opgetreden bij het laden van meditaties");
      } finally {
        setLoading(false);
      }
    };
    
    processUrls();
  }, [meditations]);
  
  const categories = Array.from(
    new Set(processedMeditations.map((meditation) => meditation.category))
  );
  
  const filteredMeditations = processedMeditations.filter((meditation) => {
    const matchesSearch = meditation.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) || 
      meditation.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
        
    const matchesCategory = selectedCategory 
      ? meditation.category === selectedCategory 
      : true;
      
    return matchesSearch && matchesCategory;
  });
  
  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery("");
  };
  
  const currentMeditationWithUrls = currentMeditation
    ? processedMeditations.find(m => m.id === currentMeditation.id) || currentMeditation
    : null;
    
  const handleSoundscapeChange = (soundscapeId: string) => {
    setCurrentSoundscapeId(soundscapeId);
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Meditaties</h1>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        {showFilters && (
          <div className="space-y-3 animate-slide-in">
            <Input
              placeholder="Zoek een meditatie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(
                    selectedCategory === category ? null : category
                  )}
                >
                  {category}
                </Badge>
              ))}
              
              {(selectedCategory || searchQuery) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleClearFilters}
                  className="ml-auto flex items-center gap-1 h-5 text-xs"
                >
                  <X className="h-3 w-3" /> Wis filters
                </Button>
              )}
            </div>
          </div>
        )}
        
        <div className="space-y-3 pb-20">
          {filteredMeditations.map((meditation) => (
            <Card 
              key={meditation.id} 
              className={cn(
                "overflow-hidden cursor-pointer hover:shadow-md transition-shadow animate-slide-in",
                currentMeditation?.id === meditation.id ? 
                  "ring-2 ring-primary/50" : "neo-morphism"
              )}
              onClick={() => setCurrentMeditation(meditation)}
            >
              <div className="flex h-24">
                <div
                  className="w-24 bg-cover bg-center"
                  style={{ backgroundImage: `url(${meditation.coverImageUrl})` }}
                />
                <CardContent className="flex-1 p-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium">{meditation.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {meditation.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {meditation.duration} min
                    </div>
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
          
          {filteredMeditations.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <p>Geen meditaties gevonden die aan je filters voldoen.</p>
              <Button 
                variant="link" 
                onClick={handleClearFilters}
              >
                Wis filters
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Dialog 
        open={currentMeditation !== null} 
        onOpenChange={(open) => !open && setCurrentMeditation(null)}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentMeditationWithUrls?.title}</DialogTitle>
            <DialogDescription>
              {currentMeditationWithUrls?.description}
            </DialogDescription>
          </DialogHeader>
          
          {currentMeditationWithUrls && (
            <div className="space-y-4">
              <div 
                className="w-full h-80 bg-cover bg-center rounded-md"
                style={{ backgroundImage: `url(${currentMeditationWithUrls.coverImageUrl})`, objectFit: "cover" }}
              />
              
              <div className="grid grid-cols-1 gap-3">
                <AudioPlayer 
                  audioUrl={currentMeditationWithUrls.audioUrl} 
                  className="w-full"
                  showTitle={false}
                  showQuote={true}
                />
                
                <MixerPanel 
                  soundscapes={soundscapes} 
                  maxDisplayed={4}
                  resetVolumesOnChange={true}
                  externalSoundscapeId={currentSoundscapeId}
                  onSoundscapeChange={handleSoundscapeChange}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default Meditations;
