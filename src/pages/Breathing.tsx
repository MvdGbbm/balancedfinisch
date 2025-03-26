
import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { BreathingMusicPlayer } from "@/components/breathing/breathing-music-player";
import BreathingAnimation, { BreathingTechnique as AnimationTechnique } from "@/components/breathing/breathing-animation";
import { BreathingCounter } from "@/components/breathing/breathing-counter";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { BreathingTechnique } from "@/lib/types";

// Fallback default exercises if none exist in localStorage
const defaultBreathingExercises = [
  { 
    id: '1', 
    name: '4-7-8', 
    technique: '4-7-8',
    description: 'A calming breathing technique that helps with relaxation',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 5
  },
  { 
    id: '2', 
    name: 'Box Breathing', 
    technique: 'box-breathing',
    description: 'Square breathing for focus and calm',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    cycles: 4
  },
  { 
    id: '3', 
    name: 'Diafragma', 
    technique: 'diaphragmatic',
    description: 'Deep breathing from the diaphragm for relaxation',
    inhale: 4,
    hold1: 0,
    exhale: 6,
    hold2: 0,
    cycles: 6
  }
];

const Breathing = () => {
  const [selectedTechnique, setSelectedTechnique] = useState<AnimationTechnique>('4-7-8');
  const [breathingExercises, setBreathingExercises] = useState<BreathingTechnique[]>([]);
  const counterRef = React.useRef<{ resetCount: () => void } | null>(null);

  // Load breathing exercises from localStorage
  useEffect(() => {
    const savedExercises = localStorage.getItem('breathingPatterns');
    if (savedExercises) {
      try {
        const parsedExercises = JSON.parse(savedExercises);
        setBreathingExercises(parsedExercises);
      } catch (error) {
        console.error("Error loading breathing exercises:", error);
        setBreathingExercises(defaultBreathingExercises);
      }
    } else {
      setBreathingExercises(defaultBreathingExercises);
    }
  }, []);

  const handleAnimationReset = () => {
    // Reset counter if it exists
    if (counterRef.current && counterRef.current.resetCount) {
      counterRef.current.resetCount();
    }
  };

  const handleTechniqueChange = (technique: AnimationTechnique) => {
    setSelectedTechnique(technique);
    handleAnimationReset();
  };

  return (
    <MobileLayout>
      <div className="space-y-6 animate-fade-in min-h-full p-4 rounded-lg bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/10 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="flex justify-center mb-2">
            {/* Dropdown menu for breathing exercises */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 shadow-sm">
                  {breathingExercises.find(ex => ex.technique === selectedTechnique)?.name || 'Select Technique'}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
                {breathingExercises.map((exercise) => (
                  <DropdownMenuItem 
                    key={exercise.id}
                    className={`${selectedTechnique === exercise.technique ? 'bg-primary/10 font-medium' : ''} cursor-pointer`}
                    onClick={() => handleTechniqueChange(exercise.technique as AnimationTechnique)}
                  >
                    {exercise.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 shadow-sm">
            <BreathingAnimation 
              technique={selectedTechnique} 
              onReset={handleAnimationReset}
            />
            
            <BreathingCounter ref={counterRef} />
          </div>
        </div>
        
        <BreathingMusicPlayer />
      </div>
    </MobileLayout>
  );
};

export default Breathing;
