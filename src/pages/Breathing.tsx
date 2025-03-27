
import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { BreathingMusicPlayer } from "@/components/breathing/breathing-music-player";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { BreathingPattern } from "@/lib/types";
import { BreathExercise } from "@/components/breathing/breath-exercise";

const Breathing = () => {
  const [technique, setTechnique] = useState<string>('4-7-8');
  const [breathingPatterns, setBreathingPatterns] = useState<BreathingPattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load breathing patterns from localStorage
  useEffect(() => {
    const loadPatterns = () => {
      setIsLoading(true);
      try {
        const savedPatterns = localStorage.getItem('breathingPatterns');
        if (savedPatterns) {
          const patterns = JSON.parse(savedPatterns);
          setBreathingPatterns(patterns);
          // Set the first pattern as selected by default
          if (patterns.length > 0) {
            const pattern = patterns.find((p: BreathingPattern) => p.name.includes(technique)) || patterns[0];
            setSelectedPattern(pattern);
            setTechnique(pattern.id);
          }
        }
      } catch (error) {
        console.error("Error loading breathing patterns:", error);
        toast.error("Kon ademhalingspatronen niet laden");
      } finally {
        setIsLoading(false);
      }
    };

    loadPatterns();
  }, [technique]);

  const handleTechniqueChange = (value: string) => {
    setTechnique(value);
    const pattern = breathingPatterns.find(p => p.id === value);
    if (pattern) {
      setSelectedPattern(pattern);
    }
  };

  return (
    <MobileLayout>
      <div className="space-y-6 animate-fade-in min-h-full p-4 rounded-lg bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/10 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-2xl font-bold text-center">Ademhalingsoefeningen</h1>
          
          <div className="w-full max-w-xs">
            <Select 
              value={technique} 
              onValueChange={handleTechniqueChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecteer techniek" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {breathingPatterns.map((pattern) => (
                    <SelectItem key={pattern.id} value={pattern.id}>
                      {pattern.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <BreathExercise />
        </div>
        
        <BreathingMusicPlayer />
      </div>
    </MobileLayout>
  );
};

export default Breathing;
