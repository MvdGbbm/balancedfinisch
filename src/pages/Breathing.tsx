
import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { BreathingMusicPlayer } from "@/components/breathing/breathing-music-player";
import { BreathingPattern } from "@/lib/types";
import { BreathExercise } from "@/components/breathing/breath-exercise";

const Breathing = () => {
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
            setSelectedPattern(patterns[0]);
          }
        }
      } catch (error) {
        console.error("Error loading breathing patterns:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPatterns();
  }, []);

  const handlePatternChange = (patternId: string) => {
    const pattern = breathingPatterns.find(p => p.id === patternId);
    if (pattern) {
      setSelectedPattern(pattern);
    }
  };

  return (
    <MobileLayout>
      <div className="space-y-6 animate-fade-in min-h-full p-4 rounded-lg bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/10 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-2xl font-bold text-center">Ademhalingsoefeningen</h1>
          
          <BreathExercise 
            breathingPatterns={breathingPatterns} 
            onPatternChange={handlePatternChange}
            selectedPattern={selectedPattern}
          />
        </div>
        
        <BreathingMusicPlayer />
      </div>
    </MobileLayout>
  );
};

export default Breathing;
