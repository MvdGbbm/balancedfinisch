
import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { BreathExercise } from "@/components/breathing/breath-exercise";
import { BreathingMusicPlayer } from "@/components/breathing/breathing-music-player";
import BreathingAnimation, { BreathingTechnique } from "@/components/breathing/breathing-animation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

// Define breathing pattern type based on database structure
type BreathingPattern = {
  id: string;
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number;
  description?: string;
  vera_url?: string;
  marco_url?: string;
};

const Breathing = () => {
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique>('4-7-8');
  const [breathingPatterns, setBreathingPatterns] = useState<BreathingPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeVoice, setActiveVoice] = useState<null | "vera" | "marco">(null);
  const [isActive, setIsActive] = useState(true);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const isMobile = useIsMobile();

  // Fetch breathing patterns from Supabase
  useEffect(() => {
    const fetchBreathingPatterns = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('breathing_patterns')
          .select('*');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setBreathingPatterns(data);
        } else {
          // Use default patterns if database is empty
          const defaultPatterns = [
            {
              id: "1",
              name: "4-7-8 Techniek",
              description: "Een kalmerende ademhalingstechniek die helpt bij ontspanning",
              inhale: 4,
              hold1: 7,
              exhale: 8,
              hold2: 0,
              cycles: 5,
            },
            {
              id: "2",
              name: "Box Breathing",
              description: "Vierkante ademhaling voor focus en kalmte",
              inhale: 4,
              hold1: 4,
              exhale: 4,
              hold2: 4, 
              cycles: 4,
            },
            {
              id: "3",
              name: "Diafragma",
              description: "Diafragma ademhaling voor diepe ontspanning",
              inhale: 5,
              hold1: 2,
              exhale: 6,
              hold2: 1,
              cycles: 6,
            },
          ];
          setBreathingPatterns(defaultPatterns);
        }
      } catch (error) {
        console.error('Error fetching breathing patterns:', error);
        // Use default patterns as fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchBreathingPatterns();
  }, []);

  // Handle voice selection
  const handleVoiceToggle = (voice: "vera" | "marco") => {
    if (activeVoice === voice) {
      setActiveVoice(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } else {
      setActiveVoice(voice);
      
      // Find the current pattern
      const currentPattern = breathingPatterns.find(
        pattern => pattern.name.toLowerCase().includes(selectedTechnique.toLowerCase())
      );
      
      if (currentPattern) {
        const audioUrl = voice === "vera" ? currentPattern.vera_url : currentPattern.marco_url;
        
        if (audioUrl && audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play().catch(err => console.error("Error playing audio:", err));
        }
      }
    }
  };

  return (
    <MobileLayout>
      <div className="space-y-6 animate-fade-in min-h-full p-4 rounded-lg bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/10 backdrop-blur-sm">
        <Tabs defaultValue="animation" className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="animation">Begeleide ademhaling</TabsTrigger>
            <TabsTrigger value="exercise">Ademhalingsoefeningen</TabsTrigger>
          </TabsList>
          
          <TabsContent value="animation">
            <div className="space-y-4">
              <div className="flex justify-center mb-2">
                <div className="inline-flex rounded-md shadow-sm">
                  <button 
                    onClick={() => setSelectedTechnique('4-7-8')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                      selectedTechnique === '4-7-8' 
                        ? 'bg-primary text-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    4-7-8
                  </button>
                  <button 
                    onClick={() => setSelectedTechnique('box-breathing')}
                    className={`px-4 py-2 text-sm font-medium ${
                      selectedTechnique === 'box-breathing' 
                        ? 'bg-primary text-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    Box Breathing
                  </button>
                  <button 
                    onClick={() => setSelectedTechnique('diaphragmatic')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                      selectedTechnique === 'diaphragmatic' 
                        ? 'bg-primary text-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    Diafragma
                  </button>
                </div>
              </div>
              
              <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 shadow-sm">
                <audio ref={audioRef} className="hidden" />
                <BreathingAnimation technique={selectedTechnique} />
                
                {/* Add Marco/Vera buttons */}
                <div className="grid grid-cols-2 gap-4 mt-6 max-w-xs mx-auto">
                  <Button 
                    onClick={() => handleVoiceToggle("vera")}
                    variant={activeVoice === "vera" ? "secondary" : "default"}
                    className={activeVoice === "vera" 
                      ? "bg-blue-700 hover:bg-blue-800" 
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none"
                    }
                  >
                    {activeVoice === "vera" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    Vera
                  </Button>
                  
                  <Button 
                    onClick={() => handleVoiceToggle("marco")}
                    variant={activeVoice === "marco" ? "secondary" : "default"}
                    className={activeVoice === "marco" 
                      ? "bg-blue-700 hover:bg-blue-800" 
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none"
                    }
                  >
                    {activeVoice === "marco" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    Marco
                  </Button>
                </div>
                
                {activeVoice && (
                  <p className="text-center text-sm text-muted-foreground animate-pulse mt-3">
                    {activeVoice === "vera" ? "Vera begeleidt je ademhaling..." : "Marco begeleidt je ademhaling..."}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="exercise">
            <BreathExercise />
          </TabsContent>
        </Tabs>
        
        <BreathingMusicPlayer />
      </div>
    </MobileLayout>
  );
};

export default Breathing;
