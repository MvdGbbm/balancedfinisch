
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Meditation, DailyQuote } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { AudioPlayer } from "@/components/audio-player";
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2,
  Quote,
  ListMusic,
  Calendar
} from "lucide-react";
import { MeditationList } from "./meditation-subcategory";
import { toast } from "sonner";

interface MeditationPlayerContainerProps {
  meditation: Meditation | null;
  recommendedMeditations?: Meditation[];
  onSelectMeditation: (meditation: Meditation) => void;
  onClose: () => void;
}

export const MeditationPlayerContainer: React.FC<MeditationPlayerContainerProps> = ({
  meditation,
  recommendedMeditations,
  onSelectMeditation,
  onClose,
}) => {
  const { meditations, plannerEvents, addPlannerEvent, getRandomQuote } = useApp();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRecommended, setShowRecommended] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<DailyQuote | null>(null);
  
  useEffect(() => {
    // Reset states when meditation changes
    setShowRecommended(false);
    setShowQuote(false);
  }, [meditation?.id]);
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const handlePrevious = () => {
    if (!meditation) return;
    
    const index = meditations.findIndex(m => m.id === meditation.id);
    if (index > 0) {
      onSelectMeditation(meditations[index - 1]);
    } else {
      // Loop to the end
      onSelectMeditation(meditations[meditations.length - 1]);
    }
  };
  
  const handleNext = () => {
    if (!meditation) return;
    
    const index = meditations.findIndex(m => m.id === meditation.id);
    if (index < meditations.length - 1) {
      onSelectMeditation(meditations[index + 1]);
    } else {
      // Loop to the beginning
      onSelectMeditation(meditations[0]);
    }
  };
  
  const handleShowRandomQuote = () => {
    setCurrentQuote(getRandomQuote());
    setShowQuote(true);
  };
  
  const handleAddToPlanner = () => {
    if (!meditation) return;
    
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    
    const existingEvent = plannerEvents.find(
      event => event.meditationId === meditation.id && event.date === dateStr
    );
    
    if (existingEvent) {
      toast.info("Deze meditatie staat al in je planner voor vandaag");
      return;
    }
    
    addPlannerEvent({
      title: meditation.title,
      date: dateStr,
      time: null,
      duration: meditation.duration,
      completed: false,
      meditationId: meditation.id,
    });
    
    toast.success("Meditatie toegevoegd aan planner voor vandaag");
  };
  
  if (!meditation) {
    return null;
  }
  
  // Create a meditation related quote
  const meditationQuote: DailyQuote = {
    id: "meditation-quote",
    text: "Adem diep in, en voel je lichaam ontspannen met elke uitademing.",
    author: "ZenMind"
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent 
        className={`p-0 ${isFullscreen ? 'w-full h-full max-w-none rounded-none' : 'sm:max-w-xl'}`}
        hideCloseButton
      >
        <div className={`flex flex-col ${isFullscreen ? 'h-[calc(100vh-2rem)]' : 'max-h-[80vh]'}`}>
          <div 
            className="relative aspect-video w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${meditation.coverImageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent">
              <div className="flex justify-between items-start p-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="h-8 w-8 bg-black/30 backdrop-blur-sm hover:bg-black/50"
                >
                  <ChevronLeft className="h-4 w-4 text-white" />
                  <span className="sr-only">Close</span>
                </Button>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleFullscreen}
                    className="h-8 w-8 bg-black/30 backdrop-blur-sm hover:bg-black/50"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4 text-white" />
                    ) : (
                      <Maximize2 className="h-4 w-4 text-white" />
                    )}
                    <span className="sr-only">Fullscreen</span>
                  </Button>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-xl font-bold text-white">{meditation.title}</h2>
                <p className="text-sm text-white/80">{meditation.duration} minuten</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={handleAddToPlanner}
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Toevoegen aan planner
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={() => setShowRecommended(!showRecommended)}
              >
                <ListMusic className="h-3.5 w-3.5 mr-1.5" />
                {showRecommended ? "Verberg aanbevolen" : "Toon aanbevolen"}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={handleShowRandomQuote}
              >
                <Quote className="h-3.5 w-3.5 mr-1.5" />
                Inspiratie
              </Button>
            </div>
            
            {showRecommended && (
              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-medium">Aanbevolen meditaties</h3>
                <div className="rounded-md border overflow-hidden">
                  <MeditationList 
                    meditations={recommendedMeditations || []}
                    onSelectMeditation={onSelectMeditation}
                    compact={true}
                  />
                </div>
              </div>
            )}
            
            <div className="rounded-lg overflow-hidden border">
              <AudioPlayer
                audioUrl={meditation.audioUrl}
                title={meditation.title}
                showTitle={false}
                autoPlay={false}
                loop={false}
                quote={currentQuote || meditationQuote}
                onPlay={() => console.log("Playing...")}
                onPause={() => console.log("Paused...")}
              />
            </div>
            
            <div className="pt-2">
              <h3 className="text-sm font-medium">Beschrijving</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {meditation.description}
              </p>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="flex-1 sm:flex-none mr-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Vorige
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="flex-1 sm:flex-none"
              >
                Volgende
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
