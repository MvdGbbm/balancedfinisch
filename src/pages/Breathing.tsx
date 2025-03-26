
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
      <div className="min-h-full p-6 space-y-8 animate-fade-in">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Breathe and Relax
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Practice mindful breathing for inner peace
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex justify-center mb-4">
            {/* Dropdown menu for breathing exercises */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-white/90 dark:bg-gray-800/90 border border-blue-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                >
                  {breathingExercises.find(ex => ex.technique === selectedTechnique)?.name || 'Select Technique'}
                  <ChevronDown className="ml-2 h-4 w-4 text-blue-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-blue-100 dark:border-gray-700 shadow-lg"
                align="center"
              >
                {breathingExercises.map((exercise) => (
                  <DropdownMenuItem 
                    key={exercise.id}
                    className={`${selectedTechnique === exercise.technique ? 'bg-blue-50 dark:bg-blue-900/20 font-medium text-blue-600 dark:text-blue-300' : ''} cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}
                    onClick={() => handleTechniqueChange(exercise.technique as AnimationTechnique)}
                  >
                    {exercise.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="bg-gradient-to-br from-white/80 to-blue-50/80 dark:from-gray-800/80 dark:to-gray-900/80 rounded-2xl p-6 shadow-xl border border-blue-100/50 dark:border-blue-900/30">
            <div className="flex flex-col items-center">
              <BreathingAnimation 
                technique={selectedTechnique} 
                onReset={handleAnimationReset}
              />
              
              <div className="mt-4 text-center">
                <BreathingCounter ref={counterRef} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <BreathingMusicPlayer />
        </div>
        
        {/* Benefits section */}
        <div className="mt-8 px-4 py-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-900/30">
          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">
            Benefits of Regular Practice
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center mr-2 mt-0.5">
                <span className="text-blue-600 dark:text-blue-300 text-xs">✓</span>
              </div>
              <span>Reduces stress and anxiety</span>
            </li>
            <li className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center mr-2 mt-0.5">
                <span className="text-blue-600 dark:text-blue-300 text-xs">✓</span>
              </div>
              <span>Improves focus and concentration</span>
            </li>
            <li className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center mr-2 mt-0.5">
                <span className="text-blue-600 dark:text-blue-300 text-xs">✓</span>
              </div>
              <span>Enhances overall well-being</span>
            </li>
          </ul>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Breathing;
